import { useCallback, useEffect, useState } from "react";
import DatePicker, { registerLocale } from 'react-datepicker';
import zh_TW from 'date-fns/locale/zh-TW';
import "react-datepicker/dist/react-datepicker.css";
import { cityConfig } from '../constants/cityConfig';

const Selectors = (props)=>{

    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [dateOnPicker,setDateOnPicker] = useState('');
    const [selectValue,setSelectValue] = useState({dist:null,workingState:null});
    const {options, condition, mapParameters, setCondition, setPageIndex, setMapParameters}= props;

    const INITAIL = useCallback(()=>{
        let node = document.getElementById('districtionSelect');
        setCSSChosenValue(node);
        setCSSChosenValue(node.previousElementSibling, node.value);
        registerLocale('zh-TW',zh_TW);
    },[]);

    useEffect(()=>{
        INITAIL();
        setSelectValue({dist:getSelectValue('districtionSelect'), workingState:getSelectValue('workingStateSelect')});
    },[INITAIL]);

    const setCSSChosenValue = (element, value=element.value)=>{
        element.dataset.chosen = value;
    }

    const addZero2String = (time)=>{
        let _time = typeof time === "number" ? time.toString() : time;
        if(_time.length === 1) _time = '0'+_time;
        return _time;
    }

    const clearMapInfo = ()=>{
        // 只有在選擇特定地區時才切換地圖中心，保持使用者的地圖操作
        const selectedDistrict = getSelectValue('districtionSelect');
        console.log('🎯 目前選擇的地區:', selectedDistrict);
        
        let center = mapParameters.center; // 保持目前的地圖中心
        let shouldChangeCenter = false;
        
        const cityDistrictMap = {
            taipei: ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'],
            newtaipei: ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '土城區', '蘆洲區', '樹林區', '汐止區', '鶯歌區', '三峽區', '淡水區', '瑞芳區', '五股區', '泰山區', '林口區', '深坑區', '石碇區', '坪林區', '三芝區', '石門區', '八里區', '平溪區', '雙溪區', '貢寮區', '金山區', '萬里區', '烏來區'],
            taoyuan: ['桃園區', '中壢區', '平鎮區', '八德區', '楊梅區', '蘆竹區', '大溪區', '龍潭區', '龜山區', '大園區', '觀音區', '新屋區', '復興區'],
            taichung: ['中區', '東區', '南區', '西區', '北區', '北屯區', '西屯區', '南屯區', '太平區', '大里區', '霧峰區', '烏日區', '豐原區', '后里區', '石岡區', '東勢區', '和平區', '新社區', '潭子區', '大雅區', '神岡區', '大肚區', '沙鹿區', '龍井區', '梧棲區', '清水區', '大甲區', '外埔區', '大安區'],
            tainan: ['中西區', '東區', '南區', '北區', '安平區', '安南區', '永康區', '歸仁區', '新化區', '左鎮區', '玉井區', '楠西區', '南化區', '仁德區', '關廟區', '龍崎區', '官田區', '麻豆區', '佳里區', '西港區', '七股區', '將軍區', '學甲區', '北門區', '新營區', '後壁區', '白河區', '東山區', '六甲區', '下營區', '柳營區', '鹽水區', '善化區', '大內區', '山上區', '新市區', '安定區'],
            kaohsiung: ['新興區', '前金區', '苓雅區', '鹽埕區', '鼓山區', '旗津區', '前鎮區', '三民區', '楠梓區', '小港區', '左營區', '仁武區', '大社區', '岡山區', '路竹區', '阿蓮區', '田寮區', '燕巢區', '橋頭區', '梓官區', '彌陀區', '永安區', '湖內區', '鳳山區', '大寮區', '林園區', '鳥松區', '大樹區', '旗山區', '美濃區', '六龜區', '內門區', '杉林區', '甲仙區', '桃源區', '那瑪夏區', '茂林區', '茄萣區'],
            hsinchu: ['東區', '北區', '香山區'],
            changhua: ['彰化市', '員林市', '和美鎮', '鹿港鎮', '溪湖鎮', '二林鎮', '田中鎮', '北斗鎮'],
            keelung: ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '七堵區', '暖暖區']
        };
        
        // 只有當選擇特定行政區時才切換地圖中心
        if (selectedDistrict && selectedDistrict !== '全區域' && selectedDistrict !== '載入中' && selectedDistrict !== '全地區') {
            for (const [key, districts] of Object.entries(cityDistrictMap)) {
                if (districts.includes(selectedDistrict) && cityConfig[key]) {
                    center = cityConfig[key].center;
                    shouldChangeCenter = true;
                    break;
                }
            }
        }
        
        setMapParameters({
            center: center,
            polygon: null,
            zoom: shouldChangeCenter ? 12 : mapParameters.zoom, // 只有切換城市時才重設縮放
            selectMarker: mapParameters.selectMarker,
            closeInfoWindow: true
        });
    }

    const getSelectValue = (id)=>{
        let element = document.getElementById(id);
        let value = null;

        if(element === null) value = '載入中';
        else{
            value =  element.value;
            if(id === 'workingStateSelect'){
                switch(value){
                    case '0' : 
                        value = '全案件';
                        break;
                    case '是' :
                        value = '施工中';
                        break;
                    case '否' :
                        value = '未施工';
                        break;
                    default:
                        break;
                }
            }
            if(id === 'districtionSelect' && value === '0'){
                value = '全地區';
            }
        }
        
        return value;
    }

    const convertWorkingState = (value)=>{
        let state = null;
        switch(value){
            case 0 : 
                state = '全案件';
                break;
            case '是' :
                state = '施工中';
                break;
            case '否' :
                state = '未施工';
                break;
            default:
                break;
        }
        return state;
    }

    const handleWorkingState = (e)=>{
        let dist = condition.distriction;
        let workingState = Number(e.target.value) === 0 ? 0 : e.target.value;
        let startDate = condition.date.start === null ? null : {...condition.date.start};
        let endDate = condition.date.end === null ? null : {...condition.date.end};
        let _dateOnPicker = dateOnPicker;
        let stack = condition.stack;
        setCSSChosenValue(e.target);
        setCSSChosenValue(e.target.previousElementSibling, e.target.value);
        setSelectValue((prevState)=>({
            ...prevState,
            workingState: convertWorkingState(workingState)
        }));

        if(stack.indexOf('workingState') === -1) stack.push('workingState');
        else if(workingState === 0){
            stack = stack.filter((e)=>e!=='workingState');
            // [stack, [workingState, dist, startDate, endDate, _dateOnPicker]] = popStack('workingState',[workingState, dist, startDate, endDate, _dateOnPicker]);
        }

        clearMapInfo();
        setPageIndex(0);
        if(_dateOnPicker !== '') setDateOnPicker(`${startDate.year}/${addZero2String(startDate.month)}/${addZero2String(startDate.day)} - ${endDate.year}/${addZero2String(endDate.month)}/${addZero2String(endDate.day)}`);
        else setDateOnPicker('');
        setCondition({workingState: workingState,
                      distriction:dist,
                      date:{
                        start: startDate === null ? null : {...startDate},
                        end: endDate === null ? null : {...endDate}
                      },
                      stack:stack});
    }
    
    const handleDistChange = (e)=>{
        let dist = Number(e.target.value) === 0 ? 0 : e.target.value;
        let workingState = condition.workingState;
        let startDate = condition.date.start === null ? null : {...condition.date.start};
        let endDate = condition.date.end === null ? null : {...condition.date.end};
        let _dateOnPicker = dateOnPicker;
        let stack = condition.stack;
        setCSSChosenValue(e.target);
        setCSSChosenValue(e.target.previousElementSibling, e.target.value);
        setSelectValue((prevState)=>({
            ...prevState,
            dist: dist === 0 ? '全地區' : dist
        }));

        if(stack.indexOf('distriction') === -1) stack.push('distriction');
        else if(dist === 0){
            stack = stack.filter((e)=>e!=='distriction');
            // [stack, [workingState, dist, startDate, endDate, _dateOnPicker]] = popStack('distriction',[workingState, dist, startDate, endDate, _dateOnPicker]);
        }

        clearMapInfo();
        setPageIndex(0);
        if(_dateOnPicker !== '') setDateOnPicker(`${startDate.year}/${addZero2String(startDate.month)}/${addZero2String(startDate.day)} - ${endDate.year}/${addZero2String(endDate.month)}/${addZero2String(endDate.day)}`);
        else setDateOnPicker('');
        setCondition({workingState: workingState,
                      distriction:dist,
                      date:{
                          start: startDate === null ? null : {...startDate},
                          end: endDate === null ? null : {...endDate}
                      },
                      stack:stack});
    }

    const handleDateChange = (update)=>{
        setDateRange(update);
        //如果結束日期尚未選擇，只更新date range。
        if(update[0] !== null && update[1] === null){
            setDateOnPicker(`${update[0].getFullYear()}/${addZero2String(update[0].getMonth() + 1)}/${addZero2String(update[0].getDate())} -`);
            return;
        }
        //datepicker按清空時執行，日期沒選完不會到這邊。
        if(update[0] === null && update[1] === null){
            let stack = condition.stack;
            let _dist = condition.distriction;
            let _workingState = condition.workingState;
            stack = stack.filter((e)=>e!=='date');
            // [stack, [_workingState, _dist, , , ,]] = popStack('date',[_workingState, _dist, null, null, null])

            clearMapInfo();
            setDateOnPicker('');
            setCondition({workingState:_workingState, distriction:_dist, date:{start: null, end: null}, stack:stack});
            return;
        }

        let dist = condition.distriction;
        let workingState = condition.workingState;
        let startDate = {year: update[0].getFullYear(), month: update[0].getMonth() + 1, day: update[0].getDate()}
        let endDate = {year: update[1].getFullYear(), month: update[1].getMonth() + 1, day: update[1].getDate()}
        let stack = condition.stack;
        if(stack.indexOf('date') === -1) stack.push('date');
        clearMapInfo();
        setPageIndex(0);
        setDateOnPicker(`${startDate.year}/${addZero2String(startDate.month)}/${addZero2String(startDate.day)} - ${endDate.year}/${addZero2String(endDate.month)}/${addZero2String(endDate.day)}`);
        setCondition({workingState:workingState, distriction:dist, date:{start: {...startDate}, end: {...endDate}}, stack:stack});
    }

    const handleCityChange = (e) => {
        let city = Number(e.target.value) === 0 ? 0 : e.target.value;
        setCSSChosenValue(e.target);
        setCSSChosenValue(e.target.previousElementSibling, e.target.value);
        setSelectValue((prevState) => ({
            ...prevState,
            city: city === 0 ? '全縣市' : city
        }));

        if (city !== 0) {
            const cityEntry = Object.values(cityConfig).find(c => c.name === city);
            if (cityEntry && cityEntry.center) {
                setMapParameters({
                    center: cityEntry.center,
                    polygon: null,
                    zoom: 12,
                    selectMarker: mapParameters.selectMarker,
                    closeInfoWindow: true
                });
            }
        }

        setPageIndex(0);
        setCondition((prev) => ({
            ...prev,
            city: city,
            distriction: 0
        }));
    };

    let cityArr = options.city || [];
    let workingStateArr = Array.from({length: options.workingState.length},(_,index)=>index);
    let distArr = Array.from({length: options.distriction.length},(_,index)=>index);

    return(
        <div className='selectors'>
            <div className='selectContainer'>
                <i className="selectArrow fas fa-chevron-down"/>
                <select name='citySelect'
                        id='citySelect'
                        defaultValue='0'
                        onChange={handleCityChange}
                >
                    <option value={0}>全縣市</option>
                    {
                        cityArr.map((c)=>(
                            <option value={c} key={c}>{c}</option>
                        ))
                    }
                </select>
                <span>{selectValue.city || '全縣市'}</span>
            </div>
            <div className='selectContainer'>
                <i className="selectArrow fas fa-chevron-down"/>
                <select name='workingState'
                        id='workingStateSelect'
                        defaultValue='是'
                        onChange={handleWorkingState}
                >
                    <option value={0}>全案件</option>
                    {
                        workingStateArr.map((i)=>(
                            <option value={options.workingState[i]} key={options.workingState[i]}>
                                {options.workingState[i]==='是' ? '施工中' : '未施工'}
                            </option>
                        ))
                    }
                </select>
                <span>{selectValue.workingState}</span>
            </div>
            <div className='selectContainer'>
                <i className="selectArrow fas fa-chevron-down"/>
                <select name='distriction'
                        id='districtionSelect'
                        defaultValue='0'
                        onChange={handleDistChange}
                >
                    <option value={0}>全地區</option>
                    {
                        distArr.map((i)=>(
                            <option value={options.distriction[i]} key={options.distriction[i]}>{options.distriction[i]}</option>
                        ))
                    }
                </select>   
                <span>{selectValue.dist}</span>
            </div>
            <DatePicker
                value={dateOnPicker}
                locale='zh-TW'
                wrapperClassName='dateSelectContainer'
                className='dateSelect'
                placeholderText='日期範圍'
                dateFormat='yyyy/MM/dd'
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                minDate={new Date(Object.values(options.date.start))}
                maxDate={new Date(Object.values(options.date.end))}
                isClearable
                shouldCloseOnSelect={false}
                onChange={handleDateChange}
                onFocus={e => e.target.blur()}
            />
        </div>
    );
}

export default Selectors;