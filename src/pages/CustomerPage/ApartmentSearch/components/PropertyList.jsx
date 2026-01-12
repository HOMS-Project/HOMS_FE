import { useState } from "react";
import { Button } from "antd";
import PropertyCard from "./PropertyCard";

const PropertyList = ({ data }) => {
    if (!data || data.length === 0) {
        return <p>Không tìm thấy kết quả nào.</p>;
    }

    return (
        <div>
            {data.map((item) => (
                <PropertyCard key={item._id} property={item} />
            ))}
        </div>
    );
};

export default PropertyList;
