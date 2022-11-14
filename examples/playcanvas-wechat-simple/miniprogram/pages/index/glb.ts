import * as pc from 'playcanvas';

export function glb(canvas: any) {
  // The example demonstrates loading of glb file, which contains meshes,
  // lights and cameras, and switches between the cameras every 2 seconds.

  // Create the app and start the update loop
  const app = new pc.Application(canvas, {});
  app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);

  // the array will store loaded cameras
  let camerasComponents: Array<pc.CameraComponent> = [];

  getApp().globalData.app = app;

  const skyboxAsset = new pc.Asset("skybox", "cubemap", {
    url: "https://demo.uality.cn/helipad.dds",
  }, {
    type: pc.TEXTURETYPE_RGBM
  });


  skyboxAsset.ready(() => {
    app.scene.setSkybox(skyboxAsset.resources);
  });

  app.assets.add(skyboxAsset);
  app.assets.load(skyboxAsset);
  // app.assets.loadFromUrl("https://demo.uality.cn/1.dds", "cubemap", (error, asset) => {
  //   if (asset)
  //     app.scene.setSkybox(asset.resources);
  // })
  // Load a glb file as a container
  const url = 'https://emw-pub.uality.cn/vs50mxeb_cck/latest/vs50mxeb_cck.glb';
  app.assets.loadFromUrl(url, 'container', function (err, asset) {
    app.start();

    // create an instance using render component
    const entity = asset!.resource.instantiateRenderEntity();
    app.root.addChild(entity);

    // find all cameras - by default they are disabled
    // set their aspect ratio to automatic to work with any window size
    // camerasComponents = entity.findComponents('camera');
    // camerasComponents.forEach(component => {
    //   component.aspectRatioMode = pc.ASPECT_AUTO;
    // });

    // // enable all lights from the glb
    // const lightComponents: Array<pc.LightComponent> = entity.findComponents('light');
    // lightComponents.forEach(component => {
    //   component.enabled = true;
    // });

    // let time = 0;
    // let activeCamera = 0;
    // app.on('update', function (dt) {
    //   time -= dt;

    //   // change the camera every few seconds
    //   if (time <= 0) {
    //     time = 2;

    //     // disable current camera
    //     camerasComponents[activeCamera].enabled = false;

    //     // activate next camera
    //     activeCamera = (activeCamera + 1) % camerasComponents.length;
    //     camerasComponents[activeCamera].enabled = true;
    //   }
    // });
  });


  const camera = new pc.Entity("Camera");
  camera.addComponent("camera");
  camera.setLocalPosition(0,0,10);
  app.root.addChild(camera);
  return app;
}
