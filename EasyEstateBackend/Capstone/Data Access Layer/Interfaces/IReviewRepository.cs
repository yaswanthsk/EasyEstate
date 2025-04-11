using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Entitiy_Layer.ReviewModel;

namespace Data_Access_Layer.Interfaces
{
    public interface IReviewRepository
    {
        Task<bool> AddReviewAsync(Review review);
        Task<IEnumerable<Review>> GetAllReviewsAsync();
        Task<Review?> GetReviewByUsernameAsync(string username);
    }
}
