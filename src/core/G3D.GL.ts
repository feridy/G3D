import Buffer from './G3D.Buffer';
import Texture from '../texture/G3D.Texture';
import CubeTexture from '../texture/G3D.CubeTexture';


interface IGL {

    width: number,
    height: number,

    gl: any,

    extensions: { [prop: string]: any },
    precisions: { float: string },

    buffers: Buffer[],
    textures: Texture[],
    cubeTextures: CubeTexture[],

}

const GL: IGL = {

    width: 0,
    height: 0,

    gl: null,

    extensions: null,
    precisions: null,

    buffers: [],
    textures: [],
    cubeTextures: [],
}

export default GL;