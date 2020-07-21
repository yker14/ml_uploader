import os
import json
import datetime
from flask import Flask, jsonify, request
from urllib.parse import unquote
#import requests

app = Flask(__name__)

@app.route("/")
def homepage():
    return app.send_static_file("index.html")


@app.route('/urlload', methods=['POST'])
def UrlLoad():
    data = request.get_json(force=True)

    data = {"urls": [
            {
            "source": "Homecenter", 
            "status": "Successfully Scraped", 
            "url": "https://www.homecenter.com.co/homecenter-co/product/333563/?cid=vtrhom978514&=INTERNO"
            }
        ]}

    
    return (data, 200)

@app.route('/getpubl')
def getpublications():

    data = {"publicaciones":[
	{
	"id": 24, 
	"source": "./static/media/images/darksouls/darksouls.jpg",
	"status": "Nuevo", 
	"title": "Combo x6 sillas Napoles Espera Negra RTA Design", 
	"brand": "RTA Design", 
	"price": 169850, 
	"urlorig": "https://www.homecenter.com.co/homecenter-co/product/334041/Como-6-sillas-Napoles-Espera-Negra/334041", 
	"fuente": "Homecenter", 
	"urlml": None
	},
    {
	"id": 265,
	"source": "./static/media/images/darksouls/darksouls.jpg",
	"status": "Nuevo", 
	"title": "Combo x6 sillas Napoles Espera Negra RTA Design", 
	"brand": "RTA Design", 
	"price": 169850, 
	"urlorig": "https://www.homecenter.com.co/homecenter-co/product/334041/Como-6-sillas-Napoles-Espera-Negra/334041", 
	"fuente": "Homecenter", 
	"urlml": None
	}

    ]}

    return (data, 200)

   
@app.route('/publicaciones/<publ_id>')
def page(publ_id):

    data= {"publicacion":{
        "id": publ_id, 
        "ml_id": None, 
        "brand": "Redline", 
        "status": "Nuevo", 
        "titleraw": "Set de Herramientas Manuales de 250 Piezas", 
        "title": "Set de Herramientas Manuales de 250 Piezas Redline", 
        "category_id": "UnaCategoria", 
        "price": 227600, 
        "cost": 148400, 
        "model": "", 
        "urlml": None, 
        "description": "Tipo: Sets de herramientas\nCaracter\u00edsticas: Set de herramientas de 250 piezas.\nObservaciones: La foto de este producto ha sido ambientada, por lo cual no incluye ning\u00fan adorno, ni accesorios, ni piezas adicionales ni ning\u00fan otro elemento que lo acompa\u00f1an. El color presentado en la fotograf\u00eda es una aproximaci\u00f3n al color real y puede variar con la resoluci\u00f3n de la pantalla desde donde se esta viendo el producto.\nUso: Profesional\nRecomendaciones: Se recomienda leer instrucciones de uso y utilizar elementos de protecci\u00f3n personal.\nIncluye: 250 piezas: 1 martillo saca clavos de 13 oz, 16 llaves allen (hexagonales), 29 llaves de dado, 22 puntas de 25 mm con 2 racks, 6 llaves punta corona (8, 10, 11, 13, 14, 15 mm, 1 chicharra (mando) de 10 mm (3/8 pulgadas), 1 blow mold case.\n", 
        "available_quantity": 100, 
        "manufacturing_time": None, 
        "warranty_type": "Garant\u00eda del vendedor", 
        "warranty_time": "90 d\u00edas", 
        "envio": "ME2", 
        "currency_id": "COP", 
        "buying_mode": "buy_it_now", 
        "condition": "new", 
        "listing_type_id": "gold_special", 
        "fuente": "Homecenter", 
        "urlorig": "https://www.homecenter.com.co/homecenter-co/product/160689/?cid=494566&=INTERNA"
        }
    }

    return (data, 200)

@app.route('/publicaciones/<publ_id>/delete', methods=['POST'])
def delete(publ_id):
    
    return ('ID {} has been deleted'.format(publ_id),200)

@app.route('/publicaciones/<publ_id>/update', methods=['POST'])
def update(publ_id):
    
    return ('ID {} has been updated'.format(publ_id),200)

@app.route('/publicaciones/images/request/<publ_id>')
def imgreq(publ_id):
    
    with open("./app/static/model/images.json") as f:
        data = json.load(f)

    return (json.dumps(data),200)



@app.route('/publicaciones/images/<mainfolder>', methods=['POST'])
def imgupdate(mainfolder):
    
    fileType = request.content_type.split('/')[1]
    fileContent = request.get_data()

    #Decode the Path in mainfolder (same as Source)
    folder = unquote(mainfolder)
    fileName = request.headers.get("File-Name-Header")
    fileOrder = request.headers.get("File-Order-Header")
    
    #Create image in given folder with given name
    with open("./app/"+folder+"/"+fileName,"wb") as f:
        f.write(fileContent) 

    #Write to file
    with open("./app/static/model/images.json") as j:
        data = json.load(j)
    
        #Create image data for database
        nData = {
            "id":str(datetime.datetime.now()),
            "folder":"static/media/images/darksouls",
            "filename":fileName,
            "filetype":fileType,
            "source":folder+"/"+fileName,
            "orden":str(int(data["pictures"][len(data["pictures"])-1]["orden"])+1)
            }

        data["pictures"].append(nData)

    with open("./app/static/model/images.json", "w+") as j:
        json.dump(data, j, ensure_ascii=False, indent=4)



    return ('Successfully updated.\nFolder: {} \nFile: {}'.format(folder, fileName), 200)

@app.route('/publicaciones/images/delete/<mainfolder>', methods=['POST'])
def imgdelete(mainfolder):
    
    try:
        #Decode the Path in mainfolder (same as Source)
        folder = unquote(mainfolder)
        fileName = request.headers.get("File-Name-Header")
        fullpath = "./app/{}/{}".format(folder,fileName)

        if os.path.exists(fullpath):
            os.remove(fullpath)
        else:
            print("The file does not exist: " + fullpath)
            raise Exception("The file does not exist: " + fullpath)
        
        
        #Update file
        with open("./app/static/model/images.json") as j:
            data = json.load(j)

            for i in range(0,len(data["pictures"])):
                if data["pictures"][i]["filename"] == fileName:
                    data["pictures"].pop(i)
                    
            
        with open("./app/static/model/images.json", "w+") as j:
            json.dump(data, j, ensure_ascii=False, indent=4)
        #

        return ('Successfully updated.\nFolder: {} \nFile: {}'.format(folder, fileName), 200)

    except Exception as e:

        return ('A problem occurred while processing the request. \n Error Message: {}'.format(e.args), 400)
 

@app.route('/publicaciones/<publ_id>/publicar', methods=['POST'])
def publish(publ_id):
    try:
        return ('Successfully published '+publ_id, 200)

    except Exception as e:
        return ('A problem occurred while processing the request. \n Error Message: {}'.format(e.args), 400)

@app.route('/mlloggedid', methods=['GET'])
def getLogin():
    
    data = {"result":{"nickname":"levipipiloco"}}
    return (json.dumps(data),200)

@app.route('/userlogout', methods=['POST'])
def logoutUser():
    
    data = {"message":"User Logged Out"}
    return (json.dumps(data),200)

if __name__ == '__main__':
    app.run(host='localhost', port=8080, debug=True)