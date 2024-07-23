function add(server){
    server.get('/', function(req, resp){
    
        resp.render('main',{
            layout: 'index',
            title: 'Block-set Associative Cache Simulator',
        });
    });
}
module.exports.add = add;