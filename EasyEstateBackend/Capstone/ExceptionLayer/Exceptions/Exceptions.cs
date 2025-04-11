using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ExceptionLayer.Exceptions
{
    public class UserNotFoundException : Exception
    {
        public UserNotFoundException(string message) : base(message) { }
        public UserNotFoundException(string message, Exception innerException) : base(message, innerException) { }
    }

    // Custom exception for failure during deletion of related data (properties, statuses, etc.)
    public class DataDeletionException : Exception
    {
        public DataDeletionException(string message) : base(message) { }
        public DataDeletionException(string message, Exception innerException) : base(message, innerException) { }
    }
    public class ValidationException : Exception
    {
        public ValidationException(string message) : base(message) { }
    }

    public class DuplicateRequestException : Exception 
    { 
        public DuplicateRequestException(string message) : base(message) { }
    }
    public class InvalidInputException : Exception
    {
        public InvalidInputException(string message) : base(message) { }
    }

    public class RepositoryException : Exception
    {
        public RepositoryException(string message) : base(message) { }
        public RepositoryException(string message, Exception innerException) : base(message, innerException) { }
    }

    public class BusinessException : Exception
    {
        public BusinessException(string message) : base(message) { }
        public BusinessException(string message, Exception innerException) : base(message, innerException) { }
    }

    public class ServiceException : Exception
    {
        public ServiceException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
    public class AuthenticationException : Exception
    {
        public AuthenticationException(string message) : base(message) { }
    }

    public class RegistrationException : Exception
    {
        public RegistrationException(string message) : base(message) { }
    }

    public class AuthorizationException : Exception
    {
        public AuthorizationException(string message) : base(message) { }
    }

    public class TokenException : Exception
    {
        public TokenException(string message) : base(message) { }
    }

}
