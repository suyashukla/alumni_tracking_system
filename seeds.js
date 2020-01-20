var mongoose    =   require("mongoose"),
    Event       =   require("./models/events"),
    Comment     =   require("./models/comment");

var data=[
    {
        name: "Event 1", 
        date: "1-12-2020",
        description: "The is event 1"
    },
    {
        name: "Event 2", 
        date: "10-12-2020",
        description: "The is event 2"
    },
    {
        name: "Event 3", 
        date: "12-12-2020",
        description: "The is event 3"
    }
]

function seedDB(){
    //Remove all events
    Event.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("events removed");
        //add a few events
        data.forEach(function(seed){
            Event.create(seed, function(err, event){
                if(err){
                    console.log(err);
                }else{
                    console.log("Added an event");
                    //create a comment
                    Comment.create(
                        {
                            text: "this event is really good",
                            author:"Alumni 1"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            }else{
                                event.comments.push(comment);
                                event.save();
                                console.log("Created new comment");
                                console.log(comment);
                                console.log(event);
                            }
                        });
                }
            });
        });
    });
}

module.exports  =   seedDB;