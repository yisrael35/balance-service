const getByID = (tableName, id) => {
  return `
  SELECT * FROM ${tableName}
  WHERE id = '${id}'
  ;`
}

module.exports = {
  getByID,
}
