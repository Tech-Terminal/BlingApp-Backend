import { ValidationError, UnprocessableEntityException } from '@nestjs/common';

export const validationExceptionFactory = (errors: ValidationError[]) => {
  const formattedErrors: Record<string, string[]> = {};
  let firstErrorMessage = '';
  let totalErrors = 0;
  
  const processErrors = (validationErrors: ValidationError[], prefix = '') => {
      for (const err of validationErrors) {
          if (err.constraints) {
              const messages = Object.values(err.constraints);
              formattedErrors[prefix + err.property] = messages;
              totalErrors += messages.length;
              if (!firstErrorMessage) {
                  firstErrorMessage = messages[0];
              }
          }
          if (err.children && err.children.length > 0) {
              processErrors(err.children, `${prefix}${err.property}.`);
          }
      }
  };
  
  processErrors(errors);
  
  const remaining = totalErrors - 1;
  const message = remaining > 0 
      ? `${firstErrorMessage} (and ${remaining} more error${remaining > 1 ? 's' : ''})` 
      : firstErrorMessage;
      
  return new UnprocessableEntityException({
      message,
      errors: formattedErrors
  });
};
