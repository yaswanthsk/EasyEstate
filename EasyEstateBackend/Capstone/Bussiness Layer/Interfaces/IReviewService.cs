using Bussiness_Layer.DTOs.ReviewDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Entitiy_Layer.ReviewModel;

namespace Bussiness_Layer.Interfaces
{
    public interface IReviewService
    {
        Task<bool> AddReviewAsync(ReviewDto review);
        Task<IEnumerable<ReviewDto>> GetAllReviewsAsync();

        Task<Review> GetReviewByUsernameAsync(string username);
    }
}

