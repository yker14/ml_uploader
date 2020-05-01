from flask import Flask, jsonify, request
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
        "urlorig": "https://www.homecenter.com.co/homecenter-co/product/160689/?cid=494566&=INTERNA", 
        "pictures": [{"id": 41, "source": "static/media/images/darksouls/darksouls.jpg", "orden": 1}, {"id": 42, "source": "static/media/images/darksouls/darksouls.jpg", "orden": 2}]
        }
    }

    return (data, 200)

@app.route('/publicaciones/<publ_id>/delete', methods=['POST'])
def delete(publ_id):
    
    return ('ID {} has been deleted'.format(publ_id),200)

@app.route('/publicaciones/<publ_id>/update', methods=['POST'])
def update(publ_id):
    
    return ('ID {} has been updated'.format(publ_id),200)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)