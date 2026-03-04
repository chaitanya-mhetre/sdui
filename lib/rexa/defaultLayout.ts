/**
 * Default Flutter-style REXA JSON — used as the initial layout in Code mode.
 * Structured exactly like a real Flutter Scaffold with AppBar + body.
 */
export const DEFAULT_REXA_JSON = `{
  "type": "scaffold",
  "backgroundColor": "#F5F5F5",
  "appBar": {
    "type": "app_bar",
    "backgroundColor": "#6366F1",
    "foregroundColor": "#FFFFFF",
    "elevation": 0,
    "leading": {
      "type": "icon",
      "name": "arrow_back",
      "color": "#FFFFFF",
      "size": 22
    },
    "title": {
      "type": "text",
      "data": "REXA Preview",
      "style": {
        "fontSize": 18,
        "fontWeight": "600",
        "color": "#FFFFFF"
      }
    },
    "actions": [
      {
        "type": "icon",
        "name": "search",
        "color": "#FFFFFF",
        "size": 22
      },
      {
        "type": "icon",
        "name": "more_vert",
        "color": "#FFFFFF",
        "size": 22
      }
    ]
  },
  "body": {
    "type": "single_child_scroll_view",
    "child": {
      "type": "column",
      "mainAxisSize": "min",
      "children": [
        {
          "type": "container",
          "color": "#6366F1",
          "padding": 20,
          "child": {
            "type": "column",
            "mainAxisSize": "min",
            "children": [
              {
                "type": "row",
                "children": [
                  {
                    "type": "icon",
                    "name": "location_on",
                    "color": "#E0E7FF",
                    "size": 16
                  },
                  {
                    "type": "text",
                    "data": "Delivering to",
                    "style": {
                      "fontSize": 13,
                      "color": "#E0E7FF"
                    }
                  }
                ]
              },
              {
                "type": "text",
                "data": "Pune, Maharashtra",
                "style": {
                  "fontSize": 20,
                  "fontWeight": "bold",
                  "color": "#FFFFFF"
                }
              }
            ]
          }
        },
        {
          "type": "padding",
          "padding": 16,
          "child": {
            "type": "column",
            "mainAxisSize": "min",
            "children": [
              {
                "type": "text",
                "data": "Featured",
                "style": {
                  "fontSize": 18,
                  "fontWeight": "bold",
                  "color": "#111827"
                }
              },
              {
                "type": "card",
                "elevation": 2,
                "style": { "borderRadius": 12 },
                "child": {
                  "type": "list_tile",
                  "leading": {
                    "type": "icon",
                    "name": "restaurant",
                    "color": "#6366F1",
                    "size": 28
                  },
                  "title": "Order Food",
                  "subtitle": "500+ restaurants nearby",
                  "trailing": {
                    "type": "icon",
                    "name": "chevron_right",
                    "color": "#9CA3AF"
                  }
                }
              },
              {
                "type": "card",
                "elevation": 2,
                "style": { "borderRadius": 12 },
                "child": {
                  "type": "list_tile",
                  "leading": {
                    "type": "icon",
                    "name": "local_shipping",
                    "color": "#10B981",
                    "size": 28
                  },
                  "title": "Track Order",
                  "subtitle": "Your order is on the way",
                  "trailing": {
                    "type": "icon",
                    "name": "chevron_right",
                    "color": "#9CA3AF"
                  }
                }
              },
              {
                "type": "button",
                "data": "Explore Restaurants",
                "fullWidth": true,
                "style": {
                  "backgroundColor": "#6366F1",
                  "borderRadius": 12,
                  "fontSize": 15
                }
              }
            ]
          }
        }
      ]
    }
  }
}`;
