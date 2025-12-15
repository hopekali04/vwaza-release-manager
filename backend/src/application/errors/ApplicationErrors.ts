export class ResourceNotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} with id ${id} not found` : `${resource} not found`);
    this.name = 'ResourceNotFoundError';
  }
}

export class InvalidStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStateError';
  }
}
