module.exports = {
    checkedisabled: function(arg){
        return arg ? 'checked disabled' : '';        
    },
    disabled: function(arg){
        return arg ? 'disabled' : '';        
    },
    
    if_eq: function(a, b, opts){
        if(a==b){
            return opts.fn(this)
        } else {
            return opts.inverse(this);
        }
    }
}

