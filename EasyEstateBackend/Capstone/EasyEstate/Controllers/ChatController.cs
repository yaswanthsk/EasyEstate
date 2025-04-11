using Bussiness_Layer.DTOs.ChatDto;
using Bussiness_Layer.Implementations;
using Entitiy_Layer.AccountModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace EasyEstate.Controllers
{
    /// <summary>
    /// Handles chat functionality for sending and retrieving messages.
    /// This controller allows users to send messages to a specific receiver and retrieve chat history between users.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly ChatService _chatService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(ChatService chatService, UserManager<ApplicationUser> userManager, IHubContext<ChatHub> hubContext)
        {
            _chatService = chatService;
            _userManager = userManager;
            _hubContext = hubContext;
        }

        /// <summary>
        /// Sends a chat message to a specific user.
        /// The method identifies the sender based on the logged-in user, saves the message to the database, 
        /// and notifies both the sender and receiver via SignalR.
        /// </summary>
        /// <param name="messageDto">The details of the message, including the receiver ID and message content.</param>
        /// <returns>
        /// An IActionResult indicating the success or failure of the message delivery.
        /// </returns>
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessageDto messageDto)
        {
            var sender = await _userManager.GetUserAsync(User); // Get the logged-in user (sender)
            if (sender == null)
            {
                return Unauthorized();
            }

            messageDto.SenderId = sender.Id; // Set the senderId to the current user
            await _chatService.SaveMessageAsync(messageDto); // Save message to the database
            await _hubContext.Clients.Group(messageDto.ReceiverId).SendAsync("ReceiveMessage", messageDto.SenderId, messageDto.Message);
            await _hubContext.Clients.Group(messageDto.SenderId).SendAsync("ReceiveMessage", messageDto.SenderId, messageDto.Message);
            return Ok(new { Status = "Success", Message = "Message sent successfully" });
        }

        /// <summary>
        /// Retrieves the chat history between the logged-in user and a specific receiver.
        /// The method fetches all messages exchanged between the two users from the database.
        /// </summary>
        /// <param name="receiverId">The ID of the user with whom the chat history is to be retrieved.</param>
        /// <returns>
        /// An IActionResult containing the list of messages exchanged between the sender and the receiver.
        /// </returns>
        [HttpGet("history/{receiverId}")]
        public async Task<IActionResult> GetChatHistory(string receiverId)
        {
            var sender = await _userManager.GetUserAsync(User); // Get the logged-in user (sender)
            if (sender == null)
            {
                return Unauthorized();
            }

            // Log IDs
            Console.WriteLine($"SenderId: {sender.Id}, ReceiverId: {receiverId}");

            var messages = await _chatService.GetMessagesBetween(sender.Id, receiverId); // Fetch message history
            return Ok(messages);
        }

        /// <summary>
        /// Deletes a specific message sent by the logged-in user.
        /// The method validates the user and removes the message if it exists.
        /// </summary>
        /// <param name="messageId">The ID of the message to be deleted.</param>
        /// <returns>
        /// An <see cref="IActionResult"/> indicating the result of the operation:
        /// - <c>Unauthorized</c> if the user is not logged in.
        /// - <c>NotFound</c> if the message does not exist.
        /// - <c>Ok</c> if the message is successfully deleted.
        /// </returns>
        [HttpDelete("delete/{messageId}")]
        public async Task<IActionResult> DeleteMessage(int messageId)
        {
            var sender = await _userManager.GetUserAsync(User); // Get the logged-in user
            if (sender == null)
            {
                return Unauthorized();
            }

            // Use the service to delete the message
            var deleteResult = await _chatService.DeleteMessageAsync(messageId, sender.Id);

            if (deleteResult == null)
            {
                return NotFound(new { message = "Message not found." });
            }

            return Ok(new { message = "Message deleted successfully." });
        }

    }
}
