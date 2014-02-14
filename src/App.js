Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',
    scopeType: 'iteration',
    comboboxConfig: {
        labelWidth: 100,
        width: 300
    },
    onScopeChange: function() {
        
         var filter = this.getContext().getTimeboxScope().getQueryFilter();
                            
        filter = filter.and({
            property: 'Blocked',
            value: true  
        });
        filter.toString();
        
        
        
        Ext.create('Rally.data.WsapiDataStore', {
            model: 'Task',
            fetch: ['ObjectID', 'FormattedID','Name', 'WorkProduct','Blocked', 'BlockedReason', 'Parent', 'Feature', 'Requirement'],
            autoLoad: true,
            filters: [filter],
            listeners: {
                load: this._onDataLoaded,
                scope: this
            }
        }); 
      
    },
    _onDataLoaded: function(store, data){
                var tasks = [];
                Ext.Array.each(data, function(task) {
                    console.log('Blocked',task.get('Blocked'));
                    console.log(task.get('WorkProduct')._type);
                         var t  = {
                                ObjectID: task.get('ObjectID'),
                                FormattedID: task.get('FormattedID'),
                                Name: task.get('Name'),
                                _ref: task.get('_ref'),
                                WorkProduct: task.get('WorkProduct'),
                                Blocked: task.get('Blocked'),
                                BlockedReason: task.get('BlockedReason'),
                                WorkProductType: task.get('WorkProduct')._type
                            };
                            tasks.push(t);
                }, this);
                this._createGrid(tasks);
    },             
    
    _createGrid: function(tasks) {
        var that = this;
        var myStore = Ext.create('Rally.data.custom.Store', {
                data: tasks,
                pageSize: 100,  
            });
        if (!this.grid) {
        this.grid = this.add({
            xtype: 'rallygrid',
            store: myStore,
            columnCfgs: [
                {
                   text: 'Formatted ID', dataIndex: 'FormattedID', xtype: 'templatecolumn',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {
                    text: '', dataIndex: 'Name'
                },
                {
                    text: 'WorkProduct', dataIndex: 'WorkProduct',
                    renderer: function(val, meta, record) {
                        var type;
                        if(record.get('WorkProduct')._type === "HierarchicalRequirement") {
                            type = 'userstory';
                        }
                        else if(record.get('WorkProduct')._type === "Defect"){
                            type = 'defect';
                        }
                        return '<a href="https://rally1.rallydev.com/#/detail/' + type + '/' + record.get('WorkProduct').ObjectID + '" target="_blank">' + record.get('WorkProduct').FormattedID + '</a>';
                    }
                },
                {
                    text: 'Blocked Reason', dataIndex: 'BlockedReason'
                },
                 {
                    text: 'Parent of WorkProduct', dataIndex: 'WorkProduct',
                    renderer: function(val, meta, record) {
                        if(record.get('WorkProduct')._type !== "HierarchicalRequirement") {
                            return 'n/a'
                        }
                        else{
                            return '<a href="https://rally1.rallydev.com/#/detail/userstory/' + record.get('WorkProduct').Parent.ObjectID + '" target="_blank">' + record.get('WorkProduct').Parent.FormattedID + '</a>';
                        }
                        
                    }
                    
                },
                 {
                    text: 'Feature of WorkProduct', dataIndex: 'WorkProduct',
                    renderer: function(val, meta, record) {
                        if(record.get('WorkProduct')._type !== "HierarchicalRequirement") {
                            return 'n/a'
                        }
                        else{
                            return '<a href="https://rally1.rallydev.com/#/detail/portfolioitem/feature/' + record.get('WorkProduct').Feature.ObjectID + '" target="_blank">' + record.get('WorkProduct').Feature.FormattedID + '</a>';
                        }
                        
                    }
                    
                }
            ]
        });
         }else{
            this.grid.reconfigure(myStore);
         }
    }
});