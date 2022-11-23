import {
  platformize,
  inject,
  DEFAULT_API_LIST as DEFAULT_API_LIST_BAE,
} from 'platformize/dist-plugin';
import type { Plugin } from 'rollup';

type platformizeOptions = Parameters<typeof platformize>['0'];

export const DEFAULT_API_LIST = [...DEFAULT_API_LIST_BAE, '$defaultWebGLExtensions'];

export default function platformizePlayCanvas({
  apiList = DEFAULT_API_LIST,
  platformManagerPath,
}: platformizeOptions = {}): Plugin[] {
  return [
    playcanvasPatch(),
    inject({
      modules: {
        pc: ['playcanvas', '*'],
      },
    }),
    ...platformize({ apiList, platformManagerPath }),
  ];
}

function playcanvasPatch(): Plugin {
  return {
    name: 'playcanvasPatch',
    transform(code, filePath) {
      // if (filePath.endsWith('animation.js')) {
      // avoid Node redeclare
      code = code.replace("class Node {", "class Node_ {");
      code = code.replace("new Node(", "new Node_(");
      code = code.replace(`: Node,`, `: Node_,`);
      code = code.replace(`, Node `, `, Node_ `);
      code = code.replace(`, Node,`, `, Node_,`);
      // }

      // enable animation loop
      code = code.replace(
        `frameRequest = platform.browser ? window.requestAnimationFrame(application.tick) : null;`,
        `window.requestAnimationFrame(application.tick)`,
      );

      // taobao patch & defaultWebGLExtensions
      code = code.replace(
        `original_getExtension.call(this, name);`,
        `$defaultWebGLExtensions[name] !== undefined ? $defaultWebGLExtensions[name] : (original_getExtension.call(this, name) || null);`,
      );

      // fake browser interface check
      code = code.replace(
        `_isBrowserInterface(texture) {`,
        `_isBrowserInterface(texture) { return texture && texture.width !== undefined;`,
      );
      code = code.replace(
        `platform.browser ? window.devicePixelRatio : 1`,
        `window.devicePixelRatio`,
      );

      code = code.replace(
        `+ ShaderUtils.versionCode(device) + ShaderUtils.precisionCode(device) + '\n' + fragDefines`,
        `+ ShaderUtils.versionCode(device) + fragDefines + ShaderUtils.precisionCode(device) + '\n'`
      )

      // patch URL.createObjectUrl
      code = code.replace(
        `URL.createObjectURL(new Blob([asset.file.contents]))`,
        `URL.createObjectURL(new Blob([asset.file.contents], {type: 'image/'+path.getExtension(url.original).toLowerCase().slice(1)}))`,
      );

      // patch TouchDevice
      code = code.replace(`let touch = false;`, `let touch = true;`);
      code = code.replace(`while (!(target instanceof HTMLElement))`, `while(false)`);
      code = code.replace(`while (!(target instanceof HTMLElement))`, `while(false)`);
      code = code.replace(`let currentElement = target;`, `let currentElement = null;
      return {
        x: touch.pageX - totalOffsetX,
        y: touch.pageY - totalOffsetY
      };`);
      code = code.replace(`let currentElement = target;`, `let currentElement = null;
      return {
        x: touch.pageX - totalOffsetX,
        y: touch.pageY - totalOffsetY
      };`);


      code = code.replace(
        `return object instanceof HTMLCanvasElement || object instanceof HTMLImageElement || object instanceof HTMLVideoElement;`,
        `return false;`
        )

      //   音频
      code = code.replace(`if (resource instanceof Audio)`, `if(0)`);

      code = code.replace(`if (!this._context) {`, `if (!this._context) {this._context = wx.createWebAudioContext();`)
      code = code.replace(`this._unlocked = this._context.state === CONTEXT_STATE_RUNNING;`, `this._unlocked = true`)
      code = code.replace(`!!(typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined')`, 'true')


      //   WebAssembly
      code = code.replace("new WebAssembly.Instance(module)", "new WebAssembly.Instance(new WXWebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)))")
      code = code.replace(/WebAssembly/ig, 'WXWebAssembly')


      //   loadImage如果url是base64格式，直接调用callbak返回arraybuffer
      code = code.replace(
        `var _asset$file2;`,
        `var _asset$file2;
        if(loadUrl.indexOf("base64") > -1){
            return callback(null, wx.base64ToArrayBuffer(loadUrl.split(',')[1]));
        }`
      )

      //   code = code.replace(
      //     `const url = res.url;`,
      //     `const url = options.url;`
      //   )

      return {
        code: code,
        map: null,
      };
    },
  };
}
