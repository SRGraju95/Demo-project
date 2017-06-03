var express    = require("express");
var mysql      = require('mysql');
var email   = require("emailjs/email");
var htmlToPdf = require('html-to-pdf');
var smtp = require('nodemailer/lib/smtp-connection');
var app = express();
var jsonfile=require('jsonfile');
var file='/node/workshop template/app/config/data.json';
var dbjson=[];
exports.getconnection=function(){
  require('fs').readFile('/node/workshop template/app/config/getconnection.json','utf8',function(err,data){
    dbjson=JSON.parse(data);
    exports.connectionvalues();
  });
}
exports.login=function(eid,epass,callback){
  	connection.query("SELECT * FROM od_hr_employee_role where emp_id='"+eid+"' and password='"+epass+"'",function(err,rows){
  	if(rows.length>0){
      var roleid=rows[0].role_id;
      connection.query("select * from service_config_login_menu where menu_id in(SELECT menu_id FROM menu_map where role_id='"+roleid+"')",function(err,rows){
        return callback(rows);
      });
      }
    else{
      return callback("reject");
    }
    });
}
exports.securitysearchFn=function(searchval,callback){
  console.log(searchval);
  callback=callback||function(){};
  // console.log(searchval);
  	connection.query("SELECT salesorder_id FROM od_logistics_vehicle_salesorder_mapping where goods_vehicle_number='"+searchval+"'",function(err,rows){
      var arr=[];
  	if(rows.length>0){
        for(var i=0;i<rows.length;i++){
        connection.query("select T1.* from od_sales_sales_order_detail T1 where salesorder_id='"+rows[i].salesorder_id+"'",function(err,getrows){
      	if(getrows.length>0){
          arr.push(getrows[0]);
        }
        if(arr.length==rows.length){
          return callback(arr);
        }
        });
      }
    }
      else{
        // console.log(err);
        return callback("reject");
      }
    });
}
exports.autosecuritysearchFn=function(callback){
  callback=callback||function(){};
  	connection.query("SELECT * FROM od_logistics_finishedgoods_vehicle_status_tracking where status='in'",function(err,rows){
  	if(!err){
      return callback(rows);
    }
    else{
      return callback("reject");
    }
    });
}
exports.insertsales=function(datetimeq,rcoilsq,rtonq,status,datetimeq1,callback){
  var response={
    "salesorderdate":datetimeq,
    "containerquantity":rcoilsq,
    "orderquantity":rtonq,
    "status":status,
    "requireddeliverydate":datetimeq1
  };
  jsonfile.writeFile(file,response,function(err){
    if(!err)
    exports.writetodb();
  });
}
exports.securityjsonsaveFn=function(ino,sid,idate,delqty,vehtime,callback){
  var response={
    "InvoiceNumber":ino,
    "SalesorderId":sid,
    "InvoinceDate":idate,
    "DeliverQuantity":delqty,
    "VehicleOutTime":vehtime
  };
  jsonfile.writeFile(file,response,function(err){
    if(!err)
    return callback("json writed");
  });
  exports.securityjsontodb();
}
var securitydbjsondata=[];
exports.securityjsontodb=function(){
  // console.log("securityjsontodb");
  require('fs').readFile('/node/workshop template/app/config/data.json','utf8',function(err,jsondata){
    securitydbjsondata=JSON.parse(jsondata);
    // console.log(securitydbjsondata);
    exports.securityjsontodb_Fn(securitydbjsondata);
  });
}
var dbjsondata=[];
exports.writetodb=function(){
  require('fs').readFile('/node/workshop template/app/config/data.json','utf8',function(err,jsondata){
    dbjsondata=JSON.parse(jsondata);
    // console.log(dbjsondata);
    exports.jsontodb(dbjsondata);
  });
}
exports.jsontodb=function(dbjsondata){
  // console.log(dbjsondata);
  var jresponse={
    "salesorderdate":dbjsondata.salesorderdate,
    "containerquantity":dbjsondata.containerquantity,
    "orderquantity":dbjsondata.orderquantity,
    "status":dbjsondata.status,
    "requireddeliverydate":dbjsondata.requireddeliverydate
  };
  // console.log("jres:"+JSON.stringify(jresponse));
  connection.query('INSERT INTO od_sales_sales_order_detail SET ?',[jresponse],function(err){

    if(!err)
    console.log("saved");
    else {
      console.log("not saved");
    }
  });
}
exports.securityjsontodb_Fn=function(dbjsondata){
  //  console.log(dbjsondata);
  var jresponse={
    "invoicenumber":dbjsondata.InvoiceNumber,
    "salesorder_id":dbjsondata.SalesorderId,
    "invoicedate":dbjsondata.InvoinceDate,
    "deliveredquantity":dbjsondata.DeliverQuantity,
    "vehicleouttime":dbjsondata.VehicleOutTime
  };
  // console.log("jres:"+JSON.stringify(jresponse));
  connection.query('INSERT INTO invoice_details SET ?',[jresponse],function(err){
    if(!err)
    console.log("saved");
    else {
      console.log("not saved");
    }
  });
}

exports.ceocustomeapprovalFn=function(data,callback){
  connection.query("update md_sales_customer_detail SET status='"+data.status+"' where customer_id='"+data.customerid+"'",function(err,result){
  if(result.affectedRows>0){
      // jsonfile.writeFile(vehiclefetchpath,rows,function(err){
      // console.log("vehiclefetchpath"+err);
    // });
    return callback("updated");
  }
else{
    return callback("not updated");
  }
});
}

exports.ceocustomerajaxFn=function(callback){
  connection.query('Select * FROM md_sales_customer_detail where status="created"',function(err,rows){
  if(rows.length>0){
    // console.log(rows);
      jsonfile.writeFile("app/elements/ceo-customer-card/ceo-customer-card.json",rows,function(err){
        if(!err){
      console.log("vehicle.json created");
      return callback(rows);
      }
    else {
      console.log("ceo-customer-card.json not created"+err);
      // return callback("ceo-customer-card.json not created");
    }
    });
  }
else{
    return callback("reject");
  }
});
}
// var vehiclefetchpath=[];
// var vehiclefetchpath = "‪app/elements/vehicleorder-summary/vehicle.json";
exports.vehiclefetch=function(callback){
  connection.query("Select * FROM od_logistics_finishedgoods_vehicle_status_tracking where status='in'",function(err,rows){
  if(rows.length>0){
    // console.log(rows);
      jsonfile.writeFile("app/elements/vehicleorder-summary/vehicle.json",rows,function(err){
        if(!err){
      // console.log("vehicle.json created");
    }
    else {
      console.log("vehicle.json not created"+err);
    }
    });
  }
else{
    return callback("reject");
  }
});
}
// mapping to salesorder-summary.json
exports.searchsalesorderconncetdbFn=function(data,callback){
  connection.query("select distinct * from od_sales_sales_order_detail where salesorder_id not in(SELECT salesorder_id FROM od_logistics_vehicle_salesorder_mapping  where od_logistics_vehicle_salesorder_mapping.goods_vehicle_number='"+data+"')",function(err,rows){
  if(rows.length>0){
    // console.log(rows);
    return callback(rows);
  }
else{
    return callback("reject");
  }
});
}
exports.savesalesorderconncetdbFn=function(data,callback){
connection.query('insert into od_logistics_vehicle_salesorder_mapping SET ?',[data],function(err,result){
if(!err)
  // res.status(200).json({'returnval': "data saved"});
  return callback("saved");
else{
  console.log("savesale"+err);
  // res.status(200).json({'returnval': "Data not saved!"});
  return callback("not saved");
}
});
}

exports.supplieritempostFn=function(data,callback){
connection.query("INSERT INTO od_procurement_item_supplier_mapping SET ?",[data],function(err,result){
  if(!err){
    return callback("saved");
  }
  else{
    console.log(err);
    return callback("not saved");
  }
  });
}
exports.customeritempostFn=function(data,callback){
connection.query("INSERT INTO od_sales_item_customer_mapping SET ?",[data],function(err,result){
  if(!err){
    return callback("saved");
  }
  else{
    console.log(err);
    return callback("not saved");
  }
  });
}
exports.supplieritem_mapFn=function(callback){
connection.query(" SELECT * FROM md_procurement_item_detail WHERE item_status = 'active'",function(err,rows){
  if(!err){
    // console.log("got it");
    return callback(rows);
  }
  else{
    console.log(err);
    return callback("didn't get it");
  }
  });
}

exports.customeritem_mapFn=function(callback){
connection.query(" SELECT * FROM md_sales_finishedgoods_item_detail WHERE item_status = 'active'",function(err,rows){
  if(!err){
    return callback(rows);
  }
  else{
    console.log(err);
    return callback("didn't get it");
  }
  });
}

exports.savesupplierdetFn=function(data,callback){
  // console.log(data);
connection.query(" INSERT INTO md_procurement_supplier_detail SET ?",[data],function(result,err){
  if(!err){
    console.log("saved");
    return callback("saved");
  }
  else{
    console.log(err);
    return callback("not saved");
  }
  });
}

exports.searchsupplieridFn=function(data,callback){
  var query="SELECT md_procurement_item_detail.item_id,md_procurement_item_detail.item_name,md_procurement_item_detail.item_description,md_procurement_item_detail.item_specification1,md_procurement_item_detail.item_specification2,md_procurement_item_detail.container_id,md_procurement_item_detail.unit_of_measure_id,md_procurement_item_detail.item_group,md_procurement_item_detail.item_type_id,md_procurement_item_detail.item_status,md_procurement_item_detail.item_purchase_type,md_procurement_item_detail.item_status,md_procurement_supplier_detail.supplier_id,md_procurement_supplier_detail.supplier_name,md_procurement_supplier_detail.address_1,md_procurement_supplier_detail.address_2,md_procurement_supplier_detail.address_3,md_procurement_supplier_detail.city,md_procurement_supplier_detail.state,md_procurement_supplier_detail.country,md_procurement_supplier_detail.pincode,md_procurement_supplier_detail.mobile_1,md_procurement_supplier_detail.mobile_2,md_procurement_supplier_detail.email,md_procurement_supplier_detail.status FROM   md_procurement_item_detail left JOIN od_procurement_item_supplier_mapping ON od_procurement_item_supplier_mapping.item_id = md_procurement_item_detail.item_id left JOIN md_procurement_supplier_detail ON md_procurement_supplier_detail.supplier_id = od_procurement_item_supplier_mapping.supplier_id where md_procurement_supplier_detail.supplier_name='"+data.supname+"'";
connection.query(query,function(err,rows){
  if(rows.length>0){
      return callback(rows);
    }
  else{
    connection.query("select * from md_procurement_supplier_detail where supplier_name='"+data.supname+"'",function(err,rows){
    return callback(rows);
  });
  }
  return callback("not get");
});
}
exports.searchcustomeridFn=function(data,callback){
  var query=
  "SELECT md_sales_customer_detail.customer_id,md_sales_customer_detail.customer_name,md_sales_customer_detail.address_1,md_sales_customer_detail.address_2,md_sales_customer_detail.address_3,md_sales_customer_detail.city,md_sales_customer_detail.state,md_sales_customer_detail.country,md_sales_customer_detail.pincode,md_sales_customer_detail.mobile_1,md_sales_customer_detail.mobile_2,md_sales_customer_detail.email,md_sales_customer_detail.status,md_sales_finishedgoods_item_detail.item_id,md_sales_finishedgoods_item_detail.item_name,md_sales_finishedgoods_item_detail.item_description,md_sales_finishedgoods_item_detail.item_specification1,md_sales_finishedgoods_item_detail.item_specification2,md_sales_finishedgoods_item_detail.container_id,md_sales_finishedgoods_item_detail.unit_of_measure_id,md_sales_finishedgoods_item_detail.item_group,md_sales_finishedgoods_item_detail.item_type_id,md_sales_finishedgoods_item_detail.item_status,md_sales_finishedgoods_item_detail.item_purchase_type,md_sales_finishedgoods_item_detail.item_status FROM md_sales_customer_detail LEFT JOIN md_sales_finishedgoods_item_detail ON  md_sales_finishedgoods_item_detail.item_id  LEFT JOIN  od_sales_item_customer_mapping ON od_sales_item_customer_mapping.customer_id=md_sales_customer_detail.customer_id  WHERE md_sales_customer_detail.customer_name='"+data.supname+"'";
connection.query(query,function(err,rows){
  if(rows.length>0){
      return callback(rows);
    }
  else{
    connection.query("select * from md_sales_customer_detail where customer_name='"+data.supname+"'",function(err,rows){
    return callback(rows);
  });
  }
return callback("not get");
});
}
exports.savecustomertdetFn=function(data,callback){
  // console.log(data);
connection.query(" INSERT INTO md_sales_customer_detail SET ?",[data],function(result,err){
  if(!err){
    return callback("saved");
  }
  else{
    // console.log(err);
    return callback("saved");
  }
  });
}

exports.storeFn=function(callback){
  callback=callback||function(){};
  	connection.query("SELECT item_id,supplier_id,inward_register_number FROM od_inward_item_register where status='stores'",function(err,getrows){
        var arr=[];
  	if(getrows.length>0){
      for(var i=0;i<getrows.length;i++){
          connection.query("SELECT T1.item_name,T1.item_specification1,T2.supplier_name,T3.*,T4.item_quantity,T4.container_quantity,T4.unit_of_measure_id,T4.container_id,T4.status,T4.po_number,T4.po_date FROM md_procurement_item_detail T1 JOIN md_procurement_supplier_detail T2 ON T1.item_id = '"+getrows[i].item_id+"' AND T2.supplier_id = '"+getrows[i].supplier_id+"' JOIN od_procurement_invoice_details_od_procurement T3 ON inward_register_number='"+getrows[i].inward_register_number+"' JOIN od_inward_item_register T4 ON T4.item_id='"+getrows[i].item_id+"' where T4.status='stores'",function(err,rows){
            arr.push(rows[0]);
            if(getrows.length==arr.length){
              return callback(arr);
            }
        });
      }
    }
  });
}
exports.purchaseFn=function(callback){
  callback=callback||function(){};
  connection.query("SELECT item_id,supplier_id,inward_register_number FROM od_inward_item_register where status='purchase'",function(err,getrows){
    // console.log(JSON.stringify(getrows));
      var arr=[];
  if(getrows.length>0){
    for(var i=0;i<getrows.length;i++){
        connection.query("SELECT T1.item_name,T1.item_specification1,T2.supplier_name,T3.*,T4.item_quantity,T4.container_quantity,T4.unit_of_measure_id,T4.container_id,T4.status,T4.po_date,T4.po_number FROM md_procurement_item_detail T1 JOIN md_procurement_supplier_detail T2 ON T1.item_id = '"+getrows[i].item_id+"' AND T2.supplier_id = '"+getrows[i].supplier_id+"' JOIN od_procurement_invoice_details_od_procurement T3 ON inward_register_number='"+getrows[i].inward_register_number+"' JOIN od_inward_item_register T4 ON T4.item_id='"+getrows[i].item_id+"' where T4.status='purchase'",function(err,rows){
          arr.push(rows[0]);
          if(getrows.length==arr.length){
            return callback(arr);
          }
      });
    }
  }
});
}
exports.qualityFn=function(callback){
  callback=callback||function(){};
  connection.query("SELECT item_id,supplier_id,inward_register_number FROM od_inward_item_register where status='quality'",function(err,getrows){
    // console.log("getrows"+JSON.stringify(getrows));
      var arr=[];
  if(getrows.length>0){
    for(var i=0;i<getrows.length;i++){
        connection.query("SELECT T1.item_name,T1.item_specification1,T2.supplier_name,T3.*,T4.item_quantity,T4.container_quantity,T4.unit_of_measure_id,T4.container_id,T4.status,T4.po_date,T4.po_number FROM md_procurement_item_detail T1 JOIN md_procurement_supplier_detail T2 ON T1.item_id = '"+getrows[i].item_id+"' AND T2.supplier_id = '"+getrows[i].supplier_id+"' JOIN od_procurement_invoice_details_od_procurement T3 ON inward_register_number='"+getrows[i].inward_register_number+"' JOIN od_inward_item_register T4 ON T4.item_id='"+getrows[i].item_id+"'",function(err,rows){
          arr.push(rows[0]);
          if(getrows.length==arr.length){
            // console.log("arr"+JSON.stringify(arr));
            return callback(arr);
          }
      });
    }
  }
});
}
  exports.savecontaineridFn=function(data,callback){
    // console.log(JSON.stringify(data));
  connection.query("INSERT INTO od_item_container_detail SET ?",[data],function(err,result){
    if(!err){
      return callback("saved");
    }
    else{
      console.log(err);
      return callback("not saved");
    }
    });
  }
  exports.searchcontainer_details_for_purchase_Fn=function(data,callback){
  connection.query("select T1.*,T2.po_number,T2.po_date from od_item_container_detail T1 JOIN od_inward_item_register T2 where T2.status='purchase' and T2.inward_register_number='"+data+"' and T2.inward_register_number='"+data+"'",function(err,rows){
    if(!err){
      // console.log(JSON.stringify(rows));
      return callback(rows);
    }
    else{
      console.log(err);
      return callback("can't get rows");
    }
    });
  }
  exports.updatecontainer_to_slider_Fn=function(data,callback){
  connection.query("INSERT INTO od_quality_item_test_result SET ?",[data],function(err,result){
    if(!err){
      return callback("saved");
    }
    else{
      console.log(err);
      return callback("not saved");
    }
    });
  }
  exports.searchheatnoFn=function(searchval,callback){
    callback=callback||function(){};
    	connection.query("select * from od_production_heatnumber_batchnumber_mapping where heat_number='"+searchval+"'",function(err,rows){
    	if(rows.length>0){
          return callback(rows);
        }
      else{
        connection.query("select id from service_id_auto_generate where dummyfield='x'",function(err,retrievedData){
          // console.log(retrievedData);
          if(retrievedData.length>0){
            for(var i=0;retrievedData.length>i;i++){
              retrievedData[0].id++;
            }
            connection.query("update service_id_auto_generate set id='"+retrievedData[0].id+"' where dummyfield='x'",function(err){});
            // console.log(retrievedData);
            return callback(retrievedData);
          }
          else{
          console.log("Error:"+err);
          return callback("No ID Found to Generate");
          }
        });
        // return callback(searchval);
      }
      });
  }
  exports.insert_ht_bt_noFn=function(htno_btno_val,callback){
    callback=callback||function(){};
      connection.query("INSERT INTO od_production_heatnumber_batchnumber_mapping SET ?",[htno_btno_val],function(err,result){
      if(!err){
          return callback("inserted");
        }
      else{
        return callback("didn't insert");
      }
      });
  }
exports.updatecontaineridFn=function(updatename,grnnumber,itemquantity,containerquantity,po_number,po_date,callback){
  callback=callback||function(){};
  connection.query("select * from od_inward_item_register where status='"+updatename+"' and inward_register_number='"+grnnumber+"'",function(err,getrows){
    if(getrows.length>0){
      connection.query("update od_inward_item_register SET status='"+updatename+"_history' where inward_register_number='"+grnnumber+"' and status='"+updatename+"'",function(err,result){
        if(!err){
          connection.query("INSERT INTO od_inward_item_register SET ?",[getrows[0]],function(err,result){
            if(!err){
              if(updatename=='stores'){
                console.log("updatename"+updatename);
              connection.query("update od_inward_item_register SET accepted_container_quantity='"+containerquantity+"',accepted_item_quantity='"+itemquantity+"',po_number='"+po_number+"',po_date='"+po_date+"',status='quality' where inward_register_number='"+grnnumber+"' and status='"+updatename+"'",function(err,result){
                if(!err){
                  console.log("update");
                  return callback("updated");
                }
                else{
                  console.log(err);
                  return callback("didn't updated");
                }
              });
            }
            if(updatename=='quality'){
            connection.query("update od_inward_item_register SET accepted_container_quantity='"+containerquantity+"',accepted_item_quantity='"+itemquantity+"',status='purchase' where inward_register_number='"+grnnumber+"' and status='"+updatename+"'",function(err,result){
              if(!err){
                return callback("updated");
              }
              else{
                return callback("didn't updated");
              }
            });
          }
          if(updatename=='Purchase'){
          connection.query("update od_inward_item_register SET accepted_container_quantity='"+containerquantity+"',accepted_item_quantity='"+itemquantity+"',status='active' where inward_register_number='"+grnnumber+"' and status='"+updatename+"'",function(err,result){
            if(!err){
              connection.query("SELECT distinct od_item_inventory.*  FROM od_item_inventory INNER JOIN od_inward_item_register ON od_inward_item_register.item_id = od_item_inventory.item_id WHERE od_inward_item_register.inward_register_number = '"+grnnumber+"' and od_inward_item_register.status='purchase_history'",function(err,rows){
                if(!err){
                  var content=Number(rows[0].item_available_quantity)+Number(itemquantity);
                  connection.query("update od_item_inventory SET item_available_quantity='"+content+"' where item_id='"+rows[0].item_id+"'",function(err,result){
                    if(!err){
                      return callback("updated");
                    }
                  });
                }
                else {
                  connection.query("select item_id from od_inward_item_register where inward_register_number='"+grnnumber+"'",function(err,rows){
                    if(!err){
                      connection.query("insert into od_item_inventory item_id='"+rows[0].item_id+"' item_available_quantity='"+itemquantity+"'",function(err,result){
                        if(!err){
                          return callback("insert content into od_item_inventory table");
                        }
                        else {
                          return callback("doesn't insert content into od_item_inventory table");
                        }
                      });
                    }
                  });
                }
              });
              // return callback("updated");
            }
            else{
              return callback("didn't updated");
            }
          });
        }
            }
          });
        }
    });
  }
});
}
exports.gettestingdata=function(data,callback){
  connection.query("select T1.quality_parameter_name,T2.minimum_value,T2.maximum_value from md_quality_quality_parameter as T1 join od_quality_quailty_item_id_mapping as T2 on T1.quality_parameter_id = T2.quality_parameter_id join od_inward_item_register as T3 on T2.item_id = T3.item_id where T3.status='quality' and T3.inward_register_number='"+data+"'",function(err,testingdata){
  if(testingdata.length>0){
    return callback(testingdata);
  }
  else{
    console.log(err);
    return callback("No testingdata!");
  }
  });
}
exports.qtest=function(id,actualvalue,status,cn_no,grn_number,callback){
  connection.query("select item_id from od_inward_item_register where inward_register_number='"+grn_number+"'",function(err,rows){
    var response={
      "test_id":id,
      "item_id":rows[0].item_id,
      "actual_value":actualvalue,
      "status":status,
      "inward_register_number":grn_number,
      "container_no":cn_no
    };
  connection.query("insert into od_quality_item_test_result set ?",[response],function(err){
  if(!err)
    return callback("Saved");
  else{
    console.log(err);
    return callback("Not Saved!");
  }
  });
});
}
exports.generateIdFn=function(callback){
    connection.query("select id from service_id_auto_generate where dummyfield='x'",function(err,retrievedData){
      // console.log(retrievedData);
      if(retrievedData.length>0){
        for(var i=0;retrievedData.length>i;i++){
          retrievedData[0].id++;
        }
        connection.query("update service_id_auto_generate set id='"+retrievedData[0].id+"' where dummyfield='x'",function(err){});
        return callback(retrievedData[0].id);
      }
      else{
      console.log("Error:"+err);
      return callback("No ID Found to Generate");
      }
    });
}
exports.searchpurchase_request=function(role,callback){
if(role=="stores"){
  connection.query("select distinct T5.*,T1.*,T6.item_type_name,T7.container_name from test.md_procurement_item_detail as T5 JOIN test.od_purchase_request_external as T1 on T1.item_id=T5.item_id JOIN test.md_procurement_requisition_itemtype_department_mapping as T2 on T1.purchase_request_type_id = T2.item_type_id and T1.status='Created' JOIN test.md_hr_department_detail as T3 on T3.department_id=T2.item_owner_department JOIN test.od_hr_employee_role as T4 on T4.role=T3.department_name join test.md_item_item_type_detail as T6 on T5.item_type_id = T6.item_type_id join md_item_container_name_detail as T7 on T5.container_id = T7.container_id where T4.role='"+role+"'",function(err,purchase_requests){
  	if(purchase_requests.length>0){
      return callback(purchase_requests);
    }
    else{
      return callback("No data!");
    }
  });
}
}

exports.purchase_requestresponse=function(intnumber,respond,callback){
  console.log("intnumber"+intnumber);
  connection.query('update od_purchase_request_external set status="'+respond+'" where purchase_request_number="'+intnumber+'"',function(err,rows){
    if(rows.affectedRows>0){
      return callback("Updated");
    }
    else{
      return callback("Not Updated!");
    }
  })
}
exports.purcahseorder_CreateFn=function(callback){
  connection.query("select distinct T1.container_quantity,T1.item_quantity,T1.purchase_request_number,T1.item_required_date,T2.item_name,T2.item_id,T2.item_specification1,T3.item_type_name,T3.item_type_id,T4.container_name,T4.container_id,T5.warehouse_stores_name,T5.warehouse_stores_id,T7.*,T8.unit_of_measure_id from od_purchase_request_external as T1 join md_procurement_item_detail as T2 on T1.item_id = T2.item_id join od_procurement_item_supplier_mapping as T6 on T1.item_id = T6.item_id join md_procurement_supplier_detail as T7 on T6.supplier_id = T7.supplier_id join md_item_item_type_detail as T3 on T2.item_type_id = T3.item_type_id join md_item_container_name_detail as T4 on T2.container_id = T4.container_id join md_warehouse_warehouse_detail as T5 on T1.warehouse_stores_id = T5.warehouse_stores_id join md_item_unit_of_measure_detail as T8 on T8.unit_of_measure_id=T2.unit_of_measure_id where T1.status='active' and T7.status='approval'",function(err,rows){
    if(!err){
      return callback(rows);
    }
    else{
      return callback("Not select!");
    }
  })
}
// var global_po_number;
exports.p_o_create_Fn=function(response,data,callback){




  require('fs').readFile('./app/config/company_address.json','utf8',function(err,data1){
    var cmp_address_json=JSON.parse(data1);
    // global_po_number= data[0].purchase_order_number;
    var content = "<table width='700px'><tr><td><img src='./app/images/salesimage.jpg' height='100px' width='100px'></td><td><h1>Purchase Order</h1></td></tr></table><br><br><br><br>"
    content += "<table width='700px' border='0'><tr><td>"+cmp_address_json[0].company_name+"</td><td align='right'>Po Date:"+data[0].purchase_order_date+"</td></tr><tr><td>"+cmp_address_json[0].address_1+"</td><td align='right'>Po Number:"+data[0].purchase_order_number+"</td></tr>"
    content += "<tr><td>"+cmp_address_json[0].address_2+"</td></tr><tr><td>"+cmp_address_json[0].company_mailid+"</td></tr><tr><td>"+cmp_address_json[0].phoneno+"</td></tr></table><br><br><br><br><br>"

    content += "<table width='700px' border='0'><tr><td>To</td></tr></table><table style='margin-left:5%'>"
    content += "<tr style='margin-left:5%'><td>"+data[0].supplier_name+"</td></tr><tr style='margin-left:5%'><td>"+data[0].supplier_add1+"</td></tr><tr><td style='margin-left:5%'>"+data[0].supplier_add2+"</td></tr><tr style='margin-left:5%'><td>"+data[0].suppier_city+"</td></tr>"
    content += "<tr style='margin-left:5%'><td>"+data[0].suppier_email_id+"</td></tr><tr style='margin-left:5%'><td>"+data[0].suppier_mob_no+"</td></tr></table><br><br><br><br>"


    content += "<table width='700px' border='0'><tr><td>S.No</td><td>Item description</td><td>Qty</td><td>UOM</td><td>Rate</td><td>Amount</td></tr>"
    content += "<tr><td>1</td><td>"+data[0].itemname+"</td><td>"+data[0].item_quantity+" "+data[0].unit_of_measure_id+"</td><td></td><td>"+data[0].per_unit_price+"</td><td>"+data[0].total_price+"</td></tr></table><br><br><br><br>"

    content += "<table width='700px' style='margin-left:80%'><tr><td>Total :"+data[0].total_price+"</td></tr></table>"

    htmlToPdf.convertHTMLString(content, './app/images/'+data[0].purchase_order_number+'_Purchaseorder.pdf',
    function (error, success) {
       if (error) {
            console.log(error);
        }
        else {
            console.log("success"+JSON.stringify(success));
        }
    });
});
  connection.query(" insert into od_purchase_purchase_register SET ?",response,function(err,result){
    if(!err){
      return callback("inserted");
    }
    else{
      console.log(err);
      return callback("Not insert!");
    }
  })
}
var sender_mail_add = require('../config/sender_mail_address.json');
// console.log(sender_mail_add);
exports.send_mail_db_Fn=function(data,callback){
    var send = require('gmail-send')({
      user: sender_mail_add[0].mail_address,
      pass: sender_mail_add[0].password,
      to:   data[0].suppier_email_id,
      text:    'Purchase Order'
    });
  // console.log("sednddd"+send);
    var file = './app/images/'+data[0].purchase_order_number+'_Purchaseorder.pdf';        // File to attach

    // Override any default option and send email
    send({
      subject: 'Purchase Order po number:'+data[0].purchase_order_number,   // Override value set as default
      files: [file]                // String or array of strings of filenames to attach
    }, function (err, res) {
      console.log('* [example1] send(): err:', err, '; res:', res);
    });

}
exports.searchitem=function(role,callback){
if(role="stores"){
  connection.query("select distinct T6.supplier_id,T6.supplier_name, T1.item_name,T7.container_name from test.md_procurement_item_detail as T1 JOIN test.md_procurement_requisition_itemtype_department_mapping as T2 on T1.item_type_id = T2.item_type_id and T1.item_status='active' JOIN test.md_hr_department_detail as T3 on T3.department_id=T2.item_owner_department JOIN test.od_hr_employee_role as T4 on T4.role=T3.department_name join od_procurement_item_supplier_mapping as T5 on T1.item_id = T5.item_id join md_procurement_supplier_detail as T6 on T5.supplier_id = T6.supplier_id join md_item_container_name_detail as T7 on T1.container_id = T7.container_id  where T4.role='"+role+"'",function(err,itemnames){
    console.log(err);
    if(itemnames.length>0){
      return callback(itemnames);
    }
    else {
      return callback("No items found!");
    }
})
}
}

exports.getpurchase_requestitem=function(itemname,callback){
  connection.query("select t1.*,t2.*,t3.*,t4.* from test.md_procurement_item_detail as t1 join test.md_item_item_type_detail as t2 on t1.item_type_id=t2.item_type_id join test.md_item_container_name_detail as t3 on t1.container_id=t3.container_id join test.md_warehouse_warehouse_detail as t4 on t1.warehouse_stores_id = t4.warehouse_stores_id where t1.item_name='"+itemname+"'",function(err,itemdetails){
    if(itemdetails.length>0){
      return callback(itemdetails);
    }
    else {
      return callback("No Data!");
    }
  })
}

exports.getwarehouselocation=function(itemname,callback){
  var id;
    connection.query("select itemid from m_item_details where itemname='"+itemname+"'",function(err,itemid){
      if(itemid.length>0){
        global.id=itemid[0].itemid;
        connection.query("select * from m_item_details where itemid='"+global.id+"'",function(err,warehouselocation){
          return callback(warehouselocation);
        })
      }
      else{
        connection.query("select itemid from finishedgoods_itemtype where itemname='"+itemname+"'",function(err,itemid){
          global.id=itemid[0].itemid;
          connection.query("select * from finishedgoods_itemtype where itemid='"+global.id+"'",function(err,warehouselocation){
            return callback(warehouselocation);
          })
        })
      }
    });
}

exports.savepurchase_request=function(purchase_requestid,iid,selectedtype,itemspec1,whlocation,selectedcontainer,itemcontainerquantity,itemquantity,purchase_requestdate,requireddate,suppliername,callback){
  var data={
    "purchase_request_number":purchase_requestid,
    "purchase_request_date":purchase_requestdate,
    "purchase_request_type_id":selectedtype,
    "item_id":iid,
    "item_quantity":itemquantity,
    "container_quantity":itemcontainerquantity,
    "warehouse_stores_id":whlocation,
    "status":"Created",
    "item_required_date":requireddate,
    "supplier_name":suppliername
  }
  connection.query("insert into od_purchase_request_external set ?",[data],function(err,rows){
    if(rows.affectedRows>0){
      return callback("Saved");
    }
    else {
      return callback("Not Saved!");
    }
  })
}
