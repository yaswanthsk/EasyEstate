using System;
using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;


namespace ExceptionLayer.Exceptions
{
    public class ExceptionMiddleWare
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleWare(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (ValidationException ex)
            {
                await HandleExceptionAsync(context, ex, HttpStatusCode.BadRequest);
            }
            catch (DuplicateRequestException ex)
            {
                await HandleExceptionAsync(context, ex, HttpStatusCode.Conflict);
            }
            catch (RepositoryException ex)
            {
                await HandleExceptionAsync(context, ex, HttpStatusCode.InternalServerError);
            }
            catch (BusinessException ex)
            {
                await HandleExceptionAsync(context, ex, HttpStatusCode.InternalServerError);
            }
            catch (ServiceException ex)
            {
                await HandleExceptionAsync(context, ex, HttpStatusCode.InternalServerError);
            }
            catch (AuthenticationException ex)
            {
                // Handle AuthenticationException
                await HandleExceptionAsync(context, ex, HttpStatusCode.Unauthorized);
            }
            catch (RegistrationException ex)
            {
                // Handle RegistrationException
                await HandleExceptionAsync(context, ex, HttpStatusCode.BadRequest);
            }
            catch (AuthorizationException ex)
            {
                // Handle AuthorizationException
                await HandleExceptionAsync(context, ex, HttpStatusCode.Forbidden);
            }
            catch (TokenException ex)
            {
                // Handle TokenException
                await HandleExceptionAsync(context, ex, HttpStatusCode.Unauthorized);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex, HttpStatusCode.InternalServerError);
            }
        }
            

        private static Task HandleExceptionAsync(HttpContext context, Exception exception, HttpStatusCode statusCode)
        {

            var response = new
            {
                statusCode = (int)statusCode,
                message = exception.Message,
                details = exception.InnerException?.Message
            };

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            return context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
