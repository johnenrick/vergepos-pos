import Category from '@/database/controller/category'
class V1PostMigrateScripts{
  async run(){
    let scripts = {
      added_category_id_in_categories: async() => {
        let categoryDB = new Category()
        let categories = await categoryDB.get()
        for(let x = 0; x < categories.length; x++){
          let category = categories[x]
          if(typeof category['category_id'] === 'undefined' || category['category_id'] === null){
            category['category_id'] = 0
            await categoryDB.update(category)
          }
        }
      }
    }
    for(let script in scripts){
      let scriptRan = localStorage.getItem('v1-post-migrate-script' + script)
      if(!scriptRan){
        await scripts[script]()
        localStorage.setItem('v1-post-migrate-script' + script, true)
      }
    }
    return true
  }
}

export default new V1PostMigrateScripts()
