using Bussiness_Layer.DTOs.ChatDto;
using Data_Access_Layer.Data;
using Entitiy_Layer.ChatModel;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness_Layer.Implementations
{
    /// <summary>
    /// The `ChatService` class is responsible for managing chat messages in the system.
    /// It interacts with the database to save new messages and retrieve existing messages exchanged between users.
    /// This service uses the `AuthDbContext` to interact with the `ChatSystem` table in the database.
    /// </summary>

    public class ChatService
    {
        private readonly AuthDbContext _context;

        public ChatService(AuthDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Saves a chat message to the database.
        /// The method takes a `ChatMessageDto` containing the sender ID, receiver ID, message content, and the timestamp. 
        /// It creates a new `ChatMessage` entity and adds it to the database using the provided context.
        /// After adding the message, the changes are saved asynchronously to the database.
        /// </summary>
        /// <param name="messageDto">The data transfer object containing the chat message details, including sender ID, receiver ID, message, and timestamp.</param>
        /// <returns>A Task representing the asynchronous operation.</returns>

        public async Task SaveMessageAsync(ChatMessageDto messageDto)
        {
            var chatMessage = new ChatMessage
            {
                SenderId = messageDto.SenderId,
                ReceiverId = messageDto.ReceiverId,
                Message = messageDto.Message,
                Timestamp = DateTime.UtcNow
            };

            _context.ChatSystem.Add(chatMessage);
            await _context.SaveChangesAsync();
        }

        // Retrieve chat history between two users
        public async Task<List<ChatMessageDto>> GetMessagesBetween(string senderId, string receiverId)
        {
            try
            {
                var messages = await _context.ChatSystem
                    .Where(m => (m.SenderId == senderId && m.ReceiverId == receiverId) ||
                                (m.SenderId == receiverId && m.ReceiverId == senderId))
                    .OrderBy(m => m.Timestamp) // Changed to ascending order
                    .ToListAsync();

                Console.WriteLine($"Fetched {messages.Count} messages between {senderId} and {receiverId}");

                return messages.Select(m => new ChatMessageDto
                {
                    messageId = m.Id,
                    SenderId = m.SenderId,
                    ReceiverId = m.ReceiverId,
                    Message = m.Message,
                    Timestamp = m.Timestamp
                }).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching messages: {ex.Message}");
                throw new InvalidOperationException("Error fetching the messages.", ex);
            }
        }

        /// <summary>
        /// Retrieves all chat messages between two users (sender and receiver) from the database.
        /// The method queries the `ChatSystem` table for messages where either the sender is the first user and the receiver is the second user, or vice versa.
        /// The messages are ordered by timestamp in ascending order (oldest first).
        /// The result is returned as a list of `ChatMessageDto` objects containing the message details (sender ID, receiver ID, message content, and timestamp).
        /// </summary>
        /// <param name="senderId">The ID of the sender user.</param>
        /// <param name="receiverId">The ID of the receiver user.</param>
        /// <returns>A list of `ChatMessageDto` objects containing the details of the chat messages exchanged between the sender and receiver.</returns>
        /// <exception cref="InvalidOperationException">Thrown when an error occurs while fetching the messages from the database.</exception>

        public async Task<ChatMessage> DeleteMessageAsync(int messageId, string userId)
        {
            var message = await _context.ChatSystem
                //.Where(m => m.Id == messageId && (m.SenderId == userId || m.ReceiverId == userId))
                .Where(m => m.Id == messageId && m.SenderId == userId) //to delete only sent messages from specific user

                .FirstOrDefaultAsync();

            if (message == null)
            {
                return null; // Message not found or user is not authorized to delete
            }

            _context.ChatSystem.Remove(message);
            await _context.SaveChangesAsync();
            return message; // Return the deleted message
        }
    }
}
