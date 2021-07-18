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

    # Data modelo
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

    # Data modelo
    data = {"publicaciones":[
    {
      "as_status": "included", 
      "as_status_id": 1, 
      "brand": "Klimber", 
      "id": 24, 
      "ml_status": "pending", 
      "ml_status_id": 1000, 
      "origin": "Homecenter", 
      "price": 85000, 
      "source": "static/media/images/darksouls/logo_ui3.png", 
      "title": "Combo x 2 Colchones Junior + 2 Almohadas + Bomba KLIMBER", 
      "url_ml": None, 
      "url_orig": "https://www.homecenter.com.co/homecenter-co/product/344322/"
    },
    {
      "as_status": "included", 
      "as_status_id": 1, 
      "brand": "Klimber", 
      "id": 265, 
      "ml_status": "pending", 
      "ml_status_id": 1000, 
      "origin": "Homecenter", 
      "price": 85000, 
      "source": "static/media/images/prod2/banana.jpg", 
      "title": "Combo x 2 Colchones Junior + 2 Almohadas + Bomba KLIMBER", 
      "url_ml": None, 
      "url_orig": "https://www.homecenter.com.co/homecenter-co/product/344322/"
    }

    ]}

    return (data, 200)

   
@app.route('/publicaciones/<publ_id>')
def page(publ_id):

    # Data modelo
    with open("./app/static/model/mock/publicacionesDB.json") as f:
        data = json.load(f)

    data = data[publ_id]
    
    return (json.dumps(data),200)


@app.route('/publicaciones/<publ_id>/delete', methods=['POST'])
def delete(publ_id):
    
    #return ('ID {} has been deleted'.format(publ_id),200)
    return ('Exitoso', 200)


@app.route('/publicaciones/<publ_id>/update', methods=['POST'])
def update(publ_id):
    
    return ('ID {} has been updated'.format(publ_id),200)


@app.route('/publicaciones/images/request/<publ_id>')
def imgreq(publ_id):
    
    # Data modelo
    with open("./app/static/model/mock/images.json") as f:
        data = json.load(f)

    return (data[publ_id],200)

# Add images
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
    with open("./app/static/model/mock/images.json") as j:
        data = json.load(j)

        if len(data["pictures"]) == 0:
            orden = '1'
        else:
            orden = str(int(data["pictures"][len(data["pictures"])-1]["orden"])+1)

        #Create image data for database
        nData = {
            "id":str(datetime.datetime.now()),
            "folder": folder,
            #"folder":"static/media/images/darksouls",
            "filename":fileName,
            "filetype":fileType,
            "source":folder+"/"+fileName,
            "orden":orden
            }

        data["pictures"].append(nData)

    with open("./app/static/model/mock/images.json", "w+") as j:
        json.dump(data, j, ensure_ascii=False, indent=4)

    return ('Successfully updated.\nFolder: {} \nFile: {}'.format(folder, fileName), 200)

@app.route('/publicaciones/images/delete/<mainfolder>', methods=['POST'])
def imgdelete(mainfolder):
    
    try:
        #Decode the Path in mainfolder (same as Source)
        folder = unquote(mainfolder)
        fileName = request.headers.get("File-Name-Header")
        fileId = request.headers.get("File-ID-Header")
        fullpath = "./app/{}/{}".format(folder,fileName)

        if os.path.exists(fullpath):
            os.remove(fullpath)
        else:
            print("The file does not exist: " + fullpath)
            raise Exception("The file does not exist: " + fullpath)
        
        
        #Update file
        with open("./app/static/model/mock/images.json") as j:
            data = json.load(j)

            for i in range(0,len(data["pictures"])):
                if data["pictures"][i]["filename"] == fileName:
                    data["pictures"].pop(i)
                    break
                    
            
        with open("./app/static/model/mock/images.json", "w+") as j:
            json.dump(data, j, ensure_ascii=False, indent=4)

        return ('Successfully updated.\nFolder: {} \nFile: {}'.format(folder, fileName), 200)

    except Exception as e:

        return ('A problem occurred while processing the request. \n Error Message: {}'.format(e.args), 400)
 

@app.route('/publicaciones/<publ_id>/publicar', methods=['POST'])
def publish(publ_id):
    try:
        return ('Successfully published '+publ_id, 200)

    except Exception as e:
        return ('A problem occurred while processing the request. \n Error Message: {}'.format(e.args), 400)


@app.route('/publicaciones/<publ_id>/sync', methods=['POST'])
def sync(publ_id):

    # Data modelo
    return ('ID {} Inventario Actualizado'.format(publ_id),200)


@app.route('/publicaciones/<publ_id>/manual', methods=['POST'])
def update_to_manual(publ_id):

    # Data modelo
    return ('ID {} cambiado a manual'.format(publ_id),200)


@app.route('/publicaciones/<publ_id>/pause', methods=['POST'])
def pause(publ_id):

    # Data modelo
    return ('ID {} pausado'.format(publ_id),200)

@app.route('/publicaciones/<publ_id>/catupdate/<category>', methods=['POST'])
def category_update(publ_id, category):

    # Data modelo
    return ('Actualizado a {}'.format(category),200)

@app.route('/mlloggedid', methods=['GET'])
def getLogin():
    
    data = {"result":{"nickname":"levipipiloco"}}
    return (json.dumps(data),200)

@app.route('/userlogout', methods=['POST'])
def logoutUser():
    
    data = {"message":"User Logged Out"}
    return (json.dumps(data),200)

@app.route('/userconf/<store>', methods=['GET'])
def userconf():

    data = {
        "homecenter_user_config": {
            "MANUFACTURING_TIME": None,
            "WARRANTY_TIME": "30 días",
            "WARRANTY_TYPE": "Garantía del vendedor",
            "description_footer": "Este es texto que ira al pie de la descripción",
            "description_header": "Este es texto que ira en el encabezado de la descripción",
            "listing_type_ml_id": "Premium",
            "only_available": 1,
            "only_me2": 1,
            "proft_rate": 35,
            "selected_stores": ["Bogotá, Cedritos"],
            "users_id": 8
        }
    }
    
    return (json.dumps(data),200)

@app.route('/userconfupdate/<store>', methods=['GET'])
def userconfupdate():

    try:
        data = {}
        return ('Successfully published', 200)

    except Exception as e:
        return ('A problem occurred while processing the request. \n Error Message: {}'.format(e.args), 400)


if __name__ == '__main__':
    app.run(host='localhost', port=8080, debug=True)