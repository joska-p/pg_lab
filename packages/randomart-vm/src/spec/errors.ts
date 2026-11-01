export class VmError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'VmError';
    }
}

export class IrError extends VmError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'IrError';
    }
}

export class IsaError extends VmError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'IsaError';
    }
}

export class GrammarError extends VmError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'GrammarError';
    }
}

export class GenError extends VmError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'GenError';
    }
}

export class CodegenError extends VmError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'CodegenError';
    }
}
