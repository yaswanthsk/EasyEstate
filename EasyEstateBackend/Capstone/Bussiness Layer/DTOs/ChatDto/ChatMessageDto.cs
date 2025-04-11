using System.ComponentModel.DataAnnotations;

namespace Bussiness_Layer.DTOs.ChatDto
{
    public class ChatMessageDto
    {
        public int messageId { get; set; }

        [Required(ErrorMessage = "SenderId is required.")]
        [StringLength(50, ErrorMessage = "SenderId cannot exceed 50 characters.")]
        public string SenderId { get; set; } // The ID of the sender

        [Required(ErrorMessage = "ReceiverId is required.")]
        [StringLength(50, ErrorMessage = "ReceiverId cannot exceed 50 characters.")]
        public string ReceiverId { get; set; } // The ID of the receiver

        [Required(ErrorMessage = "Message content is required.")]
        [StringLength(1000, ErrorMessage = "Message cannot exceed 1000 characters.")]
        public string Message { get; set; } // The message content

        [Required(ErrorMessage = "Timestamp is required.")]
        public DateTime Timestamp { get; set; } // When the message was sent
    }
}
