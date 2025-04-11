using Bussiness_Layer.DTOs.ChatDto;
using Entitiy_Layer.AccountModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Bussiness_Layer.Implementations
{
    public class ChatHub : Hub
    {
        /// <summary>
        /// A SignalR hub for managing real-time chat communication. This class handles sending and receiving messages,
        /// as well as user connection management within chat groups. It ensures that messages are saved to the database
        /// and delivered to the appropriate recipients in real time.
        /// </summary>
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ChatService _chatService;
        private readonly ILogger<ChatHub> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="ChatHub"/> class with necessary services for user management,
        /// chat service, and logging.
        /// </summary>
        /// <param name="userManager">User manager to handle user-specific operations.</param>
        /// <param name="chatService">Service to handle chat message operations.</param>
        /// <param name="logger">Logger for logging chat activities and errors.</param>

        public ChatHub(UserManager<ApplicationUser> userManager, ChatService chatService, ILogger<ChatHub> logger)
        {
            _userManager = userManager;
            _chatService = chatService;
            _logger = logger;
        }

        /// <summary>
        /// Sends a chat message from the sender to the receiver and saves the message to the database.
        /// The message is also sent to both the sender and the receiver in real-time using SignalR.
        /// </summary>
        /// <param name="receiverId">The ID of the receiver user.</param>
        /// <param name="message">The message content to be sent.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        /// <exception cref="HubException">Thrown if the sender is not logged in.</exception>

        public async Task SendMessage(string receiverId, string message)
        {

            var sender = await _userManager.GetUserAsync(Context.User);
            if (sender == null)
            {
                throw new HubException("User is not logged in.");
            }

            _logger.LogInformation($"Sending message from {sender.Id} to {receiverId}: {message}");

            // Save the message in the database
            var chatMessageDto = new ChatMessageDto
            {
                SenderId = sender.Id,
                ReceiverId = receiverId,
                Message = message,
                Timestamp = DateTime.Now
            };

            await _chatService.SaveMessageAsync(chatMessageDto);

            var senderConnectionId = Context.ConnectionId;
            _logger.LogInformation($"Sender connection ID: {senderConnectionId}");

            await Clients.Group(receiverId).SendAsync("ReceiveMessage", sender.Id, message);
            await Clients.Group(sender.Id).SendAsync("ReceiveMessage", sender.Id, message);


            _logger.LogInformation($"Message sent to {sender.Id} and {receiverId}");
            _logger.LogInformation($"Sender connection ID: {Context.ConnectionId}");
            _logger.LogInformation($"Receiver connection ID: {receiverId}");

        }

        /// <summary>
        /// Adds the user to a chat group using their user ID.
        /// This allows the user to receive real-time messages sent to their user ID group.
        /// </summary>
        /// <param name="userId">The user ID of the user joining the chat group.</param>
        /// <returns>A task representing the asynchronous operation.</returns>

        public async Task JoinChat(string userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            _logger.LogInformation($"User {userId} joined the group with connection ID {Context.ConnectionId}.");
        }

        /// <summary>
        /// Removes the user from their chat group when they disconnect from the SignalR hub.
        /// </summary>
        /// <param name="exception">Any exception that occurs during the disconnection process.</param>
        /// <returns>A task representing the asynchronous disconnection operation.</returns>
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userIdentifier = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userIdentifier))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userIdentifier);
                _logger.LogInformation($"User {userIdentifier} disconnected.");
            }
            else
            {
                _logger.LogWarning($"User identifier was null when disconnecting.");
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
