import { FunctionProvider } from "./FunctionProvider";

export enum GripperCamPIPFuntions {
    SetExpandedGripper,
}

export class GripperCamPIPFunctionProvider extends FunctionProvider {
    constructor() {
        super();
        this.provideFunctions = this.provideFunctions.bind(this);
    }

    public provideFunctions(functionName: GripperCamPIPFuntions) {
        switch (functionName) {
            case GripperCamPIPFuntions.SetExpandedGripper:
                return (toggle: boolean) => {
                    FunctionProvider.remoteRobot?.setToggle("setExpandedGripperCam", toggle);
                };
        }
    }
}