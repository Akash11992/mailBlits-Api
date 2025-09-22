const filterDataByColumns = (data, columns) => {
  return data.map((item) => {
    return {
      ...columns.reduce((acc, column) => {
        acc[column] = item[column];
        return acc;
      }, {}),
    }
  });
};

module.exports = {
  filterDataByColumns
}; 