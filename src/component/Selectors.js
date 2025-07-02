import { useCallback, useEffect, useState } from "react";
import DatePicker, { registerLocale } from 'react-datepicker';
import zh_TW from 'date-fns/locale/zh-TW';
import "react-datepicker/dist/react-datepicker.css";

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
        setMapParameters({
            center: {lat : 24.1512535, lng : 120.6617366},
            polygon: null,
            zoom: 12 + (Math.random() / 10000), //cluster的顯示問題
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

    let workingStateArr = Array.from({length: options.workingState.length},(_,index)=>index);
    let distArr = Array.from({length: options.distriction.length},(_,index)=>index);

    return(
        <div className='selectors'>
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