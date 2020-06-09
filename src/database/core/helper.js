export default {
  hasForeignKey: (text, schemaBlueprint) => {
    if ((text).substring(text.length - 3) === '_id') {
      let schemaName = text.substring(0, text.length - 3)
      if (typeof schemaBlueprint[schemaName] !== 'undefined') {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  },
  generateDatabaseVersion () {
    // let fullVersion = localStorage.getItem('version')
    // let versionSegment = fullVersion.split('.')
    databaseVersion()
  }
}
