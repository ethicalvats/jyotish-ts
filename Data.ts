
namespace JyotishTS_Base{

    import * as Locality from "Jyotish/Base/Locality"
    import * as Graha from "Jyotish/Graha/Graha"
    import * as Lagna from "Jyotish/Graha/Lagna"
    import * as Upagraha from "Jyotish/Graha/Upagraha"
    import * as Arudha from "Jyotish/Bhava/Arudha"
    import * as Time from "Jyotish/Ganita/Time"
    import * as Ganita from "Jyotish/Ganita/Method/AbstractGanita/as Ganita"
    import * as AngaDefiner from "Jyotish/Panchanga/AngaDefiner"
    import * as Varga from "Jyotish/Varga/Varga"
    import * as Dasha from "Jyotish/Dasha/Dasha"
    import * as Yoga from "Jyotish/Yoga/Yoga"
    import * as Hora from "Jyotish/Muhurta/Hora"
    import * as ImportInterface from "Jyotish/Base/Import/ImportInterface"
    import {phpUtils} from "./php-util"

    class Data{
        /**
     * Bhava block
     */
    static BLOCK_BHAVA = 'bhava';
    /**
     * Dasha block
     */
    static BLOCK_DASHA = 'dasha';
    /**
     * Graha block
     */
    static BLOCK_GRAHA = 'graha';
    /**
     * Kala block
     */
    static BLOCK_KALA = 'kala';
    /**
     * Extra block
     */
    static BLOCK_LAGNA = 'lagna';
    /**
     * Panchanga block
     */
    static BLOCK_PANCHANGA = 'panchanga';
    /**
     * Rising block
     */
    static BLOCK_RISING = 'rising';
    /**
     * Upagraha block
     */
    static BLOCK_UPAGRAHA = 'upagraha';
    /**
     * User block
     */
    static BLOCK_USER  = 'user';
    /**
     * Varga block
     */
    static BLOCK_VARGA = 'varga';
    /**
     * Yoga block
     */
    static BLOCK_YOGA = 'yoga';
    
    /**
     * All blocks.
     * 
     * @var array
     */
    public static block = [
        Data.BLOCK_BHAVA,
        Data.BLOCK_DASHA,
        Data.BLOCK_GRAHA,
        Data.BLOCK_KALA,
        Data.BLOCK_LAGNA,
        Data.BLOCK_PANCHANGA,
        Data.BLOCK_RISING,
        Data.BLOCK_UPAGRAHA,
        Data.BLOCK_USER,
        Data.BLOCK_VARGA,
        Data.BLOCK_YOGA,
    ];

    /**
     * DateTime
     * 
     * @var DateTime
     */
    private DateTime = null;
    
    /**
     * Locality
     * 
     * @var Locality
     */
    private Locality = null;
    
    /**
     * Ganita object
     * 
     * @var Ganita
     */
    private Ganita = null;

    /**
     * Data array
     * 
     * @var array
     */
    private data = null;
    
    /**
     * List of blocks.
     * 
     * @param string $mode
     * @return array
     */
    public static listBlock(mode = 'calc')
    {
        const blocks = this.block.reverse();
        
        switch (mode) {
            case 'all':
                return this.block;
            case 'main':
                return [this.BLOCK_BHAVA, this.BLOCK_GRAHA, this.BLOCK_LAGNA];
            case 'worising':
                delete blocks[this.BLOCK_RISING];
                delete blocks[this.BLOCK_USER];
                break;
            case 'calc':
            default:
                delete blocks[this.BLOCK_USER];
        }
        const list = blocks.reverse();
        return list;
    }


    /**
     * Constructor
     * 
     * @param DateTime|null $DateTime Date and time
     * @param Locality|null $Locality Locality
     * @param Ganita|null $Ganita Ganita method
     */
    public constructor(DateTime: Date = null, Locality: Locality = null, Ganita: Ganita = null)
    {
        if (DateTime !== null) {
            this.setDateTime(DateTime);
        }
        if (Locality !== null) {
            this.setLocality(Locality);
        }
        if (Ganita!== null) {
            this.setGanita(Ganita);
        }
    }
    
    /**
     * Returns new Data object from import data.
     * 
     * @param ImportInterface $Source
     * @return Data
     */
    public static createFromImport(Source: ImportInterface)
    {
        let importData = Source.getImportData();
        const Data = this;
        
        for(const block of importData) {
            Data.setDataBlock(block, importData[block]);
            
            if (block == this.BLOCK_USER) {
                if (importData[block]['datetime'] !== undefined) {
                    const TimeZone = importData[block]['timezone'] !== undefined ? new DateTimeZone(importData[block]['timezone']) : null;
                    const $DateTime = new Date(importData[block]['datetime'], TimeZone);
                    Data.setDateTime($DateTime);
                }
                if (importData[block]['longitude'] !== undefined && importData[block]['latitude'] !== undefined) {
                    const $Locality = new Locality({
                        'longitude' : importData[block]['longitude'],
                        'latitude' : importData[block]['latitude'],
                        'altitude' : importData[block]['altitude']!== undefined ? importData[block]['altitude'] : 0,
                    });
                    Data.setLocality($Locality);
                }
            }
        }
        return Data;
    }
    
    /**
     * Clone data.
     */
    public __clone()
    {
        this.DateTime = this.DateTime;
    }
    
    /**
     * Return a string representation of the data.
     * 
     * @return string
     */
    public __toString() {
        return JSON.stringify(this.data);
    }

    /**
     * Set date and time.
     * 
     * @param DateTime $DateTime Date
     * @return Data
     */
    public setDateTime($DateTime: DateTime)
    {
        if (this.DateTime !== null) {
            if ($DateTime.format('z') == this.DateTime.format('z')) {
                this.clearData(Data.listBlock('worising'));
            } else {
                this.clearData();
            }
        }
        this.DateTime = $DateTime;
        
        this.data[Data.BLOCK_USER]['datetime'] = this.DateTime.format(Time.FORMAT_DATETIME);
        this.data[Data.BLOCK_USER]['timezone'] = this.DateTime.getTimezone().getName();
         
        return this;
    }
    
    /**
     * Set locality.
     * 
     * @param Locality $Locality Locality
     * @return Data
     */
    public setLocality($Locality: Locality)
    {
        if (!phpUtils.is_null(this.Locality)) {
            this.clearData();
        }
        this.Locality = $Locality;
        
        this.data[Data.BLOCK_USER]['longitude'] = this.Locality.getLongitude();
        this.data[Data.BLOCK_USER]['latitude'] = this.Locality.getLatitude();
        this.data[Data.BLOCK_USER]['altitude'] = this.Locality.getAltitude();
        
        return this;
    }
    
    /**
     * Set ganita method.
     * 
     * @param Ganita $Ganita Ganita method
     * @return Data
     */
    public setGanita($Ganita: Ganita)
    {
        this.Ganita = $Ganita;
        
        return this;
    }
    
    /**
     * Set data block.
     * 
     * @param string $blockName
     * @param array $blockData
     * @return Data
     */
    private setDataBlock($blockName, $blockData)
    {
        this.data[$blockName] = $blockData;
        
        return this;
    }

    /**
     * Get DateTime object.
     * 
     * @return DateTime
     */
    public getDateTime()
    {
        return this.DateTime;
    }
    
    /**
     * Get Locality object.
     * 
     * @return Locality
     */
    public getLocality()
    {
        return this.Locality;
    }
    
    /**
     * Get data array.
     * 
     * @param null|array $blocks Array of blocks (optional)
     * @param string $vargaKey Varga key (optional)
     * @return array Array block data
     * @throws Exception\InvalidArgumentException
     */
    public getData($blocks = null, $vargaKey = Varga.KEY_D1)
    {
        let $vargaKeyUcf = phpUtils.ucfirst($vargaKey);
        if (!phpUtils.array_key_exists($vargaKeyUcf, Varga.$varga)) {
            throw new Exception(InvalidArgumentException("Varga '$vargaKeyUcf' is not defined."));
        }
        
        let $dataVarga
        if ($vargaKeyUcf == Varga.KEY_D1) {
            $dataVarga = this.data;
        } else {
            $dataVarga = this.data[Data.BLOCK_VARGA][$vargaKeyUcf];
        }

        let $result
        
        if (phpUtils.is_null($blocks)) {
            let $result = $dataVarga;
        } else {
            $result = [];
            $blocks.foreach($block => {
                if (!phpUtils.in_array($block, Data.block)) {
                    throw new Exception(InvalidArgumentException("Block '$block' is not defined."));
                }
                $result[$block] = phpUtils.isset($dataVarga[$block]) ? $dataVarga[$block] : null;
            })
        }
        
        return $result;
    }
    
    /**
     * Calculation parameters of planets and houses.
     * 
     * @param null|array $params Array of blocks (optional)
     * @param null|array $options Options to set (optional)
     * @return Data
     * @throws Exception\UnderflowException
     */
    public calcParams($params = null, $options = null)
    {
        if (phpUtils.is_null(this.Ganita)) {
            throw new Exception\UnderflowException("Ganita is not setted.");
        }
        let $dataParams = this.Ganita.setDataInstance(this).getParams($params, $options);
        this.data = phpUtils.array_merge(this.data, $dataParams);
        
        return this;
    }
    
    /**
     * Calculation of rising and setting.
     * 
     * @param string $graha Graha key (optional)
     * @param null|array $options Options to set (optional)
     * @return Data
     * @throws Exception\UnderflowException
     */
    public calcRising($graha = Graha.KEY_SY, $options = null)
    {
        if (phpUtils.is_null(this.Ganita)) {
            throw new Exception\UnderflowException("Ganita is not setted.");
        }
        let $dataRising = this.Ganita.setDataInstance(this).getRising($graha, $options);
        this.data[Data.BLOCK_RISING] = $dataRising;
        
        return this;
    }
    
    /**
     * Calculation of panchanga.
     * 
     * @param null|array $angas Array of angas (optional)
     * @param bool $withLimit Time limit (optional)
     * @return Data
     */
    public calcPanchanga( $angas = null, $withLimit = false)
    {
        let $AngaDefiner = new AngaDefiner(this);
        let  $generateAnga = $AngaDefiner.generateAnga($angas, $withLimit);
        
        for(const $anga in $generateAnga) {
            this.data[Data.BLOCK_PANCHANGA][$anga] = $generateAnga[$anga];
        }
        return this;
    }

    /**
     * Calculation of extra lagnas.
     * 
     * @param null|array $lagnaKeys Array of lagna keys (optional)
     * @return Data
     */
    public calcExtraLagna($lagnaKeys = null)
    {
        let $Lagna = new Lagna(this);
        let $generateLagna = $Lagna.generateLagna($lagnaKeys);
        
        for( const $key in $generateLagna) {
            this.data[Data.BLOCK_LAGNA][$key] = $generateLagna[$key];
        }
        return this;
    }
    
    /**
     * Calculation of arudhas.
     * 
     * @param null|array $arudhaKeys Array of arudha keys (optional)
     * @param null|array $options Options to set (optional)
     * @return Data
     */
    public calcBhavaArudha( $arudhaKeys = null,  $options = null)
    {
        let $Arudha = new Arudha(this, $options);
        let $generateArudha = $Arudha.generateArudha($arudhaKeys);
        
        for(const $key in $generateArudha) {
            this.data[Data.BLOCK_LAGNA][$key] = $generateArudha[$key];
        }
        return this;
    }
    
    /**
     * Calculation of upagrahas.
     * 
     * @param null|array $upagrahaKeys Array of upagraha keys (optional)
     * @return Data
     */
    public calcUpagraha( $upagrahaKeys = null)
    {
        let $Upagraha = new Upagraha(this);
        let $generateUpagraha = $Upagraha.generateUpagraha($upagrahaKeys);
        
        for( const $key in $generateUpagraha) {
            this.data[Data.BLOCK_UPAGRAHA][$key] = $generateUpagraha[$key];
        }
        return this;
    }
    
    /**
     * Calculation of varga datas.
     * 
     * @param array $vargaKeys Varga keys
     * @return Data
     */
    public calcVargaData( $vargaKeys)
    {
        $vargaKeys.foreach ( $vargaKey => {
            if ($vargaKey == Varga.KEY_D1) {
                this.calcParams();
            } else {
                let $Varga = Varga.getInstance($vargaKey).setDataInstance(this);
                this.data[Data.BLOCK_VARGA][$vargaKey] = $Varga.getVargaData();
            }
        })
        return this;
    }
    
    /**
     * Calculation of dasha.
     * 
     * @param string $type Dasha type (optional)
     * @param null|string $periodKey Key of period (optional)
     * @param null|array $options Options to set (optional)
     * @return Data
     * @throws Exception\UnderflowException
     */
    public calcDasha($type = Dasha.TYPE_VIMSHOTTARI, $periodKey = 'now', $options = null)
    {
        if (phpUtils.is_null(this.DateTime)) {
            throw new Exception\UnderflowException("DateTime is not setted.");
        }
        let $Dasha = Dasha.getInstance($type, $options).setDataInstance(this);
        this.data[Data.BLOCK_DASHA][$type] = $Dasha.getPeriods($periodKey);
        
        return this;
    }

    /**
     * Calculation of yogas.
     * 
     * @param array $yogas
     * @param null|array $options Options to set (optional)
     * @return Data
     */
    public calcYoga( $yogas, $options = null)
    {
        $yogas.foreach ( $type => {
            let $Yoga = Yoga.getInstance($type, $options).setDataInstance(this);
            $Yoga.generateYoga().foreach ( $result => {
                this.data[Data.BLOCK_YOGA][$type] = $result;
            })
        })
        return this;
    }
    
    /**
     * Calculation of hora.
     * 
     * @param type $type Hora type
     * @return Data
     * @throws Exception\UnderflowException
     */
    public calcHora($type = Hora.TYPE_KALA)
    {
        if (phpUtils.is_null(this.DateTime)) {
            throw new Exception\UnderflowException("DateTime is not setted.");
        }
        let $Hora = new Hora(this);
        this.data[Data.BLOCK_KALA]['hora'] = $Hora.getHora($type);
        
        return this;
    }

    /**
     * Clear data blocks.
     * 
     * @param null|array $blocks (optional)
     */
    public clearData( $blocks = null)
    {
        if (phpUtils.is_null($blocks)) {
            $blocks = Data.listBlock();
        }
        $blocks.foreach ($block => {
            delete this.data[$block];
        })
        return this;
    }
    }

}