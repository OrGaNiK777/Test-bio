import React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";

const filtersSearch = {
  includes: (data, search) => data.includes(search),
  equals: (data, search) => data === search
};

export default function ReactTableWithFilters({ ...props }) {
  const [filters, setFilters] = React.useState({});

  function filterComponent({ onChange, column }) {
    return (
      <input
        onChange={(e) => {
          setFilters((prevFilters) => ({ ...prevFilters, [column.id]: filtersSearch.includes }));
          onChange(e.target.value);
        }}
        onKeyPress={(e) => {
          if (e.which === 13) {
            setFilters((prevFilters) => ({
              ...prevFilters,
              [column.id]: filtersSearch.equals
            }));
            onChange(e.target.value);
          }
        }}
      />
    );
  }

  function filterMethod({ id, value }, row) {
    return filters[id](String(row[id]), value);
  };

  return <ReactTable {...props} filterable FilterComponent={filterComponent} defaultFilterMethod={filterMethod} />;
}
