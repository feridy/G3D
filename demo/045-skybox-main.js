function main(
    G3D,
    {canvas, requestAnimationFrame, controlArcRotateCamera, loader}
) {
    const engine = new G3D.Engine(canvas);

    const scene = new G3D.Scene(engine);

    const camera = new G3D.ArcRotateCamera(scene);
    camera.alpha = 0;
    camera.beta = 0;
    camera.radius = 10;

    controlArcRotateCamera(canvas, camera);

    loader.loadImageQueue({
        front: 'https://gw.alicdn.com/tfs/TB1qZBqATtYBeNjy1XdXXXXyVXa-1024-1024.png',
        back: 'https://gw.alicdn.com/tfs/TB1O4QUAqmWBuNjy1XaXXXCbXXa-1024-1024.png',
        left: 'https://gw.alicdn.com/tfs/TB16.OnAwmTBuNjy1XbXXaMrVXa-1024-1024.png',
        right: 'https://gw.alicdn.com/tfs/TB1zIBqATtYBeNjy1XdXXXXyVXa-1024-1024.png',
        top: 'https://gw.alicdn.com/tfs/TB1wcxqATtYBeNjy1XdXXXXyVXa-1024-1024.png',
        bottom: 'https://gw.alicdn.com/tfs/TB1O7C5AAyWBuNjy0FpXXassXXa-1024-1024.png',
    }, ({front, back, left, right, top, bottom}) => {
        const cubeMapTexture = new CubeTexture({
            front, back,
            left,  right,
            top,   bottom,
        });

        new G3D.Skybox(scene, cubeMapTexture)
    });



    const light1 = new G3D.DirectionalLight(scene);
    light1.direction.x = -1;
    light1.direction.y = 0;
    light1.direction.z = 1;
    light1.intensity = 0.5;

    const light2 = new G3D.AmbientLight(scene);
    light2.intensity = 0.2;

    const m1 = G3D.MeshBuilder.createGround(scene, 6, 4);
    m1.position.z = -1;
    decorateMaterialBasic(m1.materials.default);

    const m2 = G3D.MeshBuilder.createSphere(scene, 1);
    m2.position.z = 1;
    decorateMaterialBasic(m2.materials.default);

    function decorateMaterialBasic(material) {
        material.ambientColor.r = 200;
        material.ambientColor.g = 100;
        material.ambientColor.b = 100;
        material.diffuseColor.r = 200;
        material.diffuseColor.g = 100;
        material.diffuseColor.b = 100;
        material.specularColor.r = 200;
        material.specularColor.g = 100;
        material.specularColor.b = 100;
        material.glossiness = 10;
    }

    function render() {
        scene.render();
        requestAnimationFrame(render);
    }

    render();
}

export default main;