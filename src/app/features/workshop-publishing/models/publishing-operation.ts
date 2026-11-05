export type PublishingOperation =
  | 'idle'
  | 'sections'
  | 'models'
  | 'history'
  | 'generate'
  | 'validate'
  | 'images'
  | 'image'
  | 'publish'
  | 'receipt';

export const publishingOperationLabels: Record<
  PublishingOperation,
  string
> = {
  idle: 'Workshop publishing',
  sections: 'Loading workshop sections',
  models: 'Loading AI models',
  history: 'Loading publishing history',
  generate: 'Generating workshop draft',
  validate: 'Validating workshop draft',
  images: 'Finding image assets',
  image: 'Generating workshop image',
  publish: 'Publishing reviewed workshop',
  receipt: 'Checking publishing receipt',
};
