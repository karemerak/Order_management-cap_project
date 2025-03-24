using orderms from '../db/schema';

service OrderManagementService @(path: '/odata/v4/order-management') {
    entity Products as
        projection on orderms.Products;

    entity Customers as
        projection on orderms.Customers;

    entity Orders as
        projection on orderms.Orders;

    entity OrderItems as
        projection on orderms.OrderItems;

    annotate Products with @restrict : [
        { grant : [ '*' ], to : [ 'Admin' ] },
        { grant : [ 'READ' ], to : [ 'User' ] }
    ];

    annotate Customers with @restrict : [
        { grant : [ '*' ], to : [ 'Admin' ] },
        { grant : [ 'READ', 'CREATE' ], to : [ 'User' ] }
    ];

    annotate Orders with @restrict : [
        { grant : [ '*' ], to : [ 'Admin' ] },
        { grant : [ 'READ', 'CREATE' ], to : [ 'User' ] }
    ];

    annotate OrderItems with @restrict : [
        { grant : [ '*' ], to : [ 'Admin' ] },
        { grant : [ 'READ', 'CREATE' ], to : [ 'User' ] }
    ];

    annotate Orders with @Aggregation.ApplySupported : {
        $Type : 'Aggregation.ApplySupportedType',
        GroupableProperties : [
            totalAmount,
            totalOrders,
            monthlyRevenue
        ],
        AggregatableProperties : [
            {
                Property : totalAmount,
                SupportedAggregationMethods : [
                    'average'
                ]
            }
        ]
    };

    @restrict : [
        { grant : [ '*' ], to : [ 'User' ] }
    ]
    action cancelOrder
    (
        orderId : UUID
    )
    returns Boolean;

    @restrict : [
        { grant : [ '*' ], to : [ 'User' ] }
    ]
    action submitOrder
    (
        orderId : UUID
    )
    returns Boolean;

    @restrict : [
        { grant : [ '*' ], to : [ 'Admin' ] }
    ]
    action acceptOrder
    (
        orderId : UUID
    )
    returns Boolean;

    @readonly
    entity OrderKPIs
    {
        key ID : UUID;
        totalOrders : Integer;
        totalRevenue : Decimal(15,2);
        averageOrderValue : Decimal(15,2);
        status : String;
        month : Date;
    }
} 