using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness_Layer.DTOs.PaymentDto
{
    public class TemporaryPaymentDto
    {
        public string UserId { get; set; }
        public decimal Amount { get; set; }
        public string Plan { get; set; }
    }
}
