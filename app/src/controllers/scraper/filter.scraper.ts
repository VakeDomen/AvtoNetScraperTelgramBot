import { KaroserijskaIzvedba } from './enums/karoserijska-izvedba.enum';
import { TipPonudbe } from './enums/tip-ponudbe.enum';
import { Starost } from './enums/starost.enum';
import { Znamka } from './enums/znamka.enum';
import { Model } from './enums/model.enum';
import { Menjalnik } from './enums/menjalnik.enum';
import { Gorivo } from './enums/gorivo.enum';

export class Filter {
    tipPonudbe: TipPonudbe;
    starost: Starost;
    karoserijskaIzvedba: KaroserijskaIzvedba[];
    zmt: ZMT[];
    cenaOd: number;
    cenaDo: number;
    oglasiBrezCene: boolean;
    letnikPrveregistracijeOd: number;
    letnikPrveRegistracijeDo: number;
    oldtimer: boolean;
    prevozenihKmOd: number;
    prevozenihKmDo: number;
    garancija: boolean;
    menjalnik: Menjalnik;
    gorivo: Gorivo;
    prostorninaMotorjaOd: number;
    prostorninaMotorjaDo: number;
    stVrat: number;
    stSedezev: number;
    klimatskaNaprava: boolean;
    avtomatskaKlima: boolean;
    gretjeMirujocegaVozila: boolean;
    gretjeSedezev: boolean;
    hlajenjeSedezev: boolean;
    elNastavitevSedezev: boolean;
    usnje: boolean;
    isofix: boolean;
    vrecaZaSmuci: boolean;
    elPomikStekel: boolean;
    centralnoZaklepanje: boolean;
    soncnaStreha: boolean;
    servoVolan: boolean;

    constructor() {
        this.tipPonudbe = TipPonudbe.PRODAJA;
        this.starost = Starost.NOVO;
        this.karoserijskaIzvedba = [
            KaroserijskaIzvedba.LIMUZINA,
            KaroserijskaIzvedba.KOMBILIMUZINA,
            KaroserijskaIzvedba.KARAVAN,
            KaroserijskaIzvedba.ENOPROSTOREC,
            KaroserijskaIzvedba.COUPE,
            KaroserijskaIzvedba.CABRIO,
            KaroserijskaIzvedba.SUV,
            KaroserijskaIzvedba.PICKUP
        ];
        this.zmt = [new ZMT()];
        this.cenaOd = 0;
        this.cenaDo = 100000;
        this.oglasiBrezCene = false;
        this.letnikPrveregistracijeOd = 2000;
        this.letnikPrveRegistracijeDo = 2050;
        this.oldtimer = false;
        this.prevozenihKmOd = 0;
        this.prevozenihKmDo = 1000000;
        this.garancija = false;
        this.menjalnik = Menjalnik.NI_POMEMBEN;
        this.gorivo = Gorivo.KATEROKOLI;
        this.prostorninaMotorjaOd = 0;
        this.prostorninaMotorjaDo = 10000;
        this.stVrat = 0;
        this.stSedezev = 0;
        this.klimatskaNaprava = false;
        this.avtomatskaKlima = false;
        this.gretjeMirujocegaVozila = false;
        this.gretjeSedezev = false;
        this.hlajenjeSedezev = false;
        this.elNastavitevSedezev = false;
        this.usnje = false;
        this.isofix = false;
        this.vrecaZaSmuci = false;
        this.elPomikStekel = false;
        this.centralnoZaklepanje = false;
        this.soncnaStreha = false;
        this.servoVolan = false;
    }


    getRequestUrl() {
        return `https://www.avto.net/Ads/results.asp?
        
        `;
    }
    
}

class ZMT {
    znamka: Znamka[];
    model: Model[];
    tip: string;

    constructor() {
        this.znamka = [Znamka.VSE_ZNAMKE];
        this.model = [Model.NI_MODELA];
        this.tip = '';
    }

    extractUrlString() {
        if (!this.znamka || [Znamka.VSE_ZNAMKE]) {
            return 'znamka=&model=&modelID=&tip=katerikoli%20tip&';
        }
    }
}

/*
https://www.avto.net/Ads/results.asp?
    znamka=Opel&
    model=&
    modelID=&
    tip=katerikoli%20
    tip&
    znamka2=&
    model2=&
    tip2=katerikoli%20tip&
    znamka3=&
    model3=&
    tip3=katerikoli%20tip&
    cenaMin=0&
    cenaMax=2500&
    letnikMin=0&
    letnikMax=2090&
    bencin=0&
    starost2=999&
    oblika=0&
    ccmMin=0&
    ccmMax=99999&
    mocMin=&
    mocMax=&
    kmMin=0&
    kmMax=9999999&
    kwMin=0&
    kwMax=999&
    motortakt=&
    motorvalji=&
    lokacija=0&
    sirina=&
    dolzina=&
    dolzinaMIN=&
    dolzinaMAX=&
    nosilnostMIN=&
    nosilnostMAX=&
    lezisc=&
    presek=&
    premer=&
    col=&
    vijakov=&
    EToznaka=&
    vozilo=&
    airbag=&
    barva=&
    barvaint=&
    EQ1=1000000000&
    EQ2=1000000000&
    EQ3=1000000000&
    EQ4=100000000&
    EQ5=1000000000&
    EQ6=1000000000&
    EQ7=1000000120&
    EQ8=1010000001&
    EQ9=1000000000&
    KAT=1010000000&
    PIA=&
    PIAzero=&
    PSLO=&
    akcija=&
    paketgarancije=&
    broker=&
    prikazkategorije=&
    kategorija=&ONLvid=&ONLnak=&zaloga=&arhiv=&presort=&tipsort=&stran=

*/