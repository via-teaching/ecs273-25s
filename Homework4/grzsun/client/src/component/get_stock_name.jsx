import * as d3 from "d3";
import { useEffect, useState } from "react";

export default function get_name() {

    const [stock_name, set_name] = useState('AAPL')

    useEffect(() => {
        const stock = d3.select("#stock-select");


        stock.on("change.getstock", function (event) {
        const name = event.target.value
        set_name(name)
          
        });

        return () => {
            stock.on("change.getstock", null);
        };
      }, []);
    
      return stock_name
    }



