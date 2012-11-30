import random
from models import *
for i in range(0,500000):
    print "Inserting # %s " % i
    d=Documentation()
    d.id_pratica = random.randint(1,100000000)
    d.canale = str(random.randint(1,100000000))
    d.cliente = str(random.randint(1,100000000))
    d.istituto = str(random.randint(1,100000000))
    d.prodotto = str(random.randint(1,100000000))
    d.finalita_prodotto = str(random.randint(1,100000000))
    d.tipologia_prodotto = str(random.randint(1,100000000))
    d.scheda = str(random.randint(1,100000000))
    d.tabella = str(random.randint(1,100000000))
    d.importo_erogato = random.ranom()*10000000000
    d.montante_lordo = random.ranom()*10000000000 
    d.interessi = random.ranom()*10000000000
    d.tan = random.ranom()*10000000000
    d.taeg = random.ranom()*10000000000
    d.teg = random.ranom()*10000000000
    d.spread = random.ranom()*10000000000
    d.ass1_obbl = random.ranom()*10000000000
    d.ass2_obbl = random.ranom()*10000000000
    d.ass2_obbl = random.ranom()*10000000000
    d.ass1_fac = random.ranom()*10000000000
    d.ass2_fac = random.ranom()*10000000000
    d.ass3_fac = random.ranom()*10000000000
    d.valore_garanzia = random.ranom()*10000000000
    d.importo_finanziato = random.ranom()*10000000000
    d.spese_1 = random.ranom()*10000000000
    d.spese_2 = random.ranom()*10000000000
    d.spese_3 = random.ranom()*10000000000
    d.spese_4 = random.ranom()*10000000000
    d.istruttoria = random.ranom()*10000000000
    d.data_decorreza = None
    d.data_fine = None
    d.durata = random.ranom()*10000000000
    d.rata = random.ranom()*10000000000
    d.rata_variata = random.ranom()*10000000000
    d.spese_rata = random.ranom()*10000000000
    d.data_caricamento = random.ranom()*10000000000
    d.data_liquidazione = random.ranom()*10000000000
    d.numero_eventi_pratica = random.ranom()*10000000000
    d.giudizio_interno_pratica = random.ranom()*10000000000
    d.giudizio_esterno_pratica = random.ranom()*10000000000
    d.scoring_pratica = random.ranom()*10000000000
    d.numero_di_tentativi_per_erogare = int(random.ranom()*10000000000)
    d.provvigioni_totali_entrata = random.ranom()*10000000000
    d.anagrafica_principale = None
    d.save()

