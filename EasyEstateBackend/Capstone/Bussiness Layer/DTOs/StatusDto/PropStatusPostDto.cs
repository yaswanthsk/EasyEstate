using System.ComponentModel.DataAnnotations.Schema;

namespace Bussiness_Layer.DTOs.StatusDto
{
    public class PropStatusPostDto
    {
        public string? UserId { get; set; }

        [ForeignKey("Properties")]
        public int PropertyID { get; set; }
        public string? OwnerID { get; set; }
        public string? StatusType { get; set; }

    }
}
