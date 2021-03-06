import Node from "../core/node";

import Mat4, { IMat4 } from "../matrix/mat4";
import Vec3, { IVec3 } from "../matrix/vec3";
import { IDirection, IPosition } from "../types/raw";

class BaseCamera extends Node {

    public center: IPosition = { x: 0, y: 0, z: 0 };

    public up: IDirection = { x: 0, y: 1, z: 0 };

    private cameraPositionValues: IVec3 = Vec3.create();
    private centerValues: IVec3 = Vec3.create();
    private upValues: IVec3 = Vec3.create();
    private viewMatrixValues: IMat4 = Mat4.create();

    public getPMatrix(): IMat4 {
        return Mat4.create();
    }

    public getVMatrix(): IMat4 {
        Vec3.set(this.cameraPositionValues, this.position.x, this.position.y, this.position.z);
        Vec3.set(this.centerValues, this.center.x, this.center.y, this.center.z);
        Vec3.set(this.upValues, this.up.x, this.up.y, this.up.z);
        Mat4.lookAt(this.viewMatrixValues, this.cameraPositionValues, this.centerValues, this.upValues);
        return this.viewMatrixValues;
    }

    // TODO: calc position in shader
    public getPosition() {
        return [this.position.x, this.position.y, this.position.z];
    }
}

export default BaseCamera;
