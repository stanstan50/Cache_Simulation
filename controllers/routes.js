function add(server){
    server.get('/', function(req, resp){
        resp.render('index',{
            layout: 'indexLayout',
            title: 'Block-set Associative Cache Simulator',
        });
    });
}
module.exports.add = add;