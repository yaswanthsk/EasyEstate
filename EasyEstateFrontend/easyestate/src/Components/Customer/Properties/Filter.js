import PropTypes from 'prop-types';
import './Filter.css'
import { Slider } from "@mui/material";
 
 
const Filter = ({ filters, setFilters }) => {
 
    const minPrice = 3000;
    const maxprice = 50000000;
 
    const handleChange = (event, newValue) => {
        if (!Array.isArray(newValue)) {
            return;
        }
        setFilters((prev) => ({ ...prev, Price: newValue }))
 
    };
 
    const getStep = (value) => {
        if (value < 100000) {
            return 10000;
        } else if (value < 1000000) {
            return 100000;
        } else {
            return 200000;
        }
    }
 
    const priceLabel = (value) => {
        return `₹${value.toLocaleString()}`; // Display with commas for thousands (e.g., ₹10,000)
    };
    const propertyTypes = [
        "Lands",
        "Plots",
        "Houses",
        "Apartments",
        "PGs",
        "Guest Houses",
        "Shops",
        "Offices"
    ];
 
    return (
        <div className="filters">
            {/* Property Type Dropdown */}
 
 
            <label>
                For Sale/For Rent:
                <select
                    value={filters.propertyFor || ""}
                    onChange={(e) =>
                        setFilters((prev) => ({ ...prev, propertyFor: e.target.value }))
                    }
                >
                    <option value="">Both Types</option>
                    <option value="Sale">For Sale</option>
                    <option value="Rent">For Rent</option>
                </select>
            </label>
 
            <label>
                Property Type:
                <select
                    value={filters.propertyType || ""}
                    onChange={(e) =>
                        setFilters((prev) => ({ ...prev, propertyType: e.target.value }))
                    }
                >
                    <option value="">All Types</option>
                    {propertyTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </label>
 
            {/* Location Input */}
            <label>
                Location:
                <input
                    type="text"
                    value={filters.location || ""}
                    onChange={(e) =>
                        setFilters((prev) => ({ ...prev, location: e.target.value }))
                    }
                />
            </label>
 
            {/* Max Price Input */}
            <label >
                Price Range: {priceLabel(filters.Price[0])} - {priceLabel(filters.Price[1])}
 
                <Slider
                    value={filters.Price}
                    onChange={handleChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={priceLabel}
                    min={minPrice}
                    max={maxprice}
                    step={Math.min(getStep(filters.Price[0]), getStep(filters.Price[1]))}
                    disableSwap
                />
 
            </label>
        </div>
    );
};
Filter.propTypes = {
    filters: PropTypes.shape({
        propertyFor:PropTypes.string,
        propertyType: PropTypes.string,
        location: PropTypes.string,
        Price: PropTypes.arrayOf(PropTypes.number).isRequired,
    }).isRequired,
    setFilters: PropTypes.func.isRequired,
};
 
export default Filter;
