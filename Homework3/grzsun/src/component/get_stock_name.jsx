import * as d3 from "d3";
import { useEffect, useState } from "react";

export default function get_name() {

    const [stock_name, set_name] = useState()

    useEffect(() => {
        const stock = d3.select("#stock-select");
        const name = stock.property("value");
        //console.log(name);
        set_name(name)

        stock.on("change.getstock", function (event) {
        const name = event.target.value
        //console.log(name);
        set_name(name)
          
        });

        return () => {
            stock.on("change.getstock", null);
        };
      }, []);
    
      return stock_name
    }



