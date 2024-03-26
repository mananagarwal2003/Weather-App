import { View, Text, Image,StyleSheet,TextInput,SafeAreaView, Touchable,TouchableOpacity,ScrollView, KeyboardAvoidingView} from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { theme } from '../../theme' 
import {debounce} from 'lodash';
import { fetchLocations, fetchWeatherForecast } from '../../api/weather';
import { weatherImages } from '../../constant';
import * as Progress from 'react-native-progress';
import { storeData,getData } from '../../utils/asyncStorage';
export default function HomeScreen(){
  const [showSearch,toggleSearch]=useState(false);
  const [locations, setLocations]= useState([]);
  const [weather,setWeather]=useState({})
  const[loading,setLoading] =useState(true);

  const handlelocation=(loc)=>{
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({cityName:loc.name,days:'7'}).then(data=>{
      setWeather(data);
      setLoading(false);
      storeData('city',loc.name);
    })
  }

  const handleSearch= value=>{
    if(value.length>2){
      fetchLocations({cityName: value}).then(data=>{
        setLocations(data);
      })
    }
  }

  useEffect(()=>{
    fetchMyWeatherData();
  },[]);
  const fetchMyWeatherData=async()=>{
    let myCity = await getData('city');
    let cityName ='Ajmer';
    if(myCity) cityName=myCity;
    fetchWeatherForecast({
      cityName,
      days:'7'
    }).then(data=>{
      setWeather(data);
      setLoading(false);
    })
  }
  const handleTextDebounce = useCallback(debounce(handleSearch,1200),[])
  const {current,location}=weather;

    return (
      <View style={styles.container}>
      <Image  blurRadius={50} source={require('../icons/bg.png')}  style={styles.img}/>
      {
        
          loading ? (
          <View style={{justifyContent:'center',alignItems:'center',fontSize:40}}>
           <Progress.CircleSnail thickness={10} size={140} color='#0bb3b2' style={{marginTop:300,marginLeft:30}}/> 
          </View>
        ):(
        <SafeAreaView style={styles.safe}>
            <View style={[styles.bar,{backgroundColor: showSearch? theme.bgWhite(0.2): 'transparent'}]}>
              {
              showSearch? (
                <TextInput onChangeText={handleTextDebounce}
                placeholder="Search city..." 
                placeholderTextColor={'lightgray'} style={{marginRight:150,fontSize:18}}
               />
              ):null
            }
              
              <TouchableOpacity onPress={()=>toggleSearch(!showSearch)}
              style={[styles.btn,{backgroundColor :theme.bgWhite(0.3)}]} 
              className="rounded-full p-3 m-1">
              <Image source={require('../icons/search-interface-symbol.png')} style={{width:23,height:23}}/>
              </TouchableOpacity>
              </View>
              {
                locations.length>0 && showSearch ? (
                  <View style={styles.list}>
                    {
                      locations.map((loc,index)=>{
                        return(
                          <TouchableOpacity 
                          onPress={()=>handlelocation(loc)}
                          key={index}
                          style={styles.content}>
                            <Image source={require('../icons/pin.png')} style={{width:20,height:20,marginRight:5}}/>
                            <Text style={{fontSize:18,opacity:0.7}}>{loc?.name},{loc?.country}</Text>
                          </TouchableOpacity>
                        )
                      })
                    }
                  </View>
                ):null
              }
              {/* forecast section */}
              <KeyboardAvoidingView behavior="height" style={{flex:1, justifyContent:'space-around',paddingTop:50}}>
                <Text style={styles.fortxt}>
                  {location?.name},<Text style={{color:'gray',fontWeight:'500',fontSize:20}}>{" "+location?.country}</Text>
                </Text>
                {/* weather image */}
                <View style={{flexDirection:"row", justifyContent:"center"}}>
                  <Image source={weatherImages[current?.condition?.text]} 
                  style={{width:150,height:150}}></Image>
                </View>
                <View>
                  <Text style={{ textAlign:"center",fontWeight:"bold",color:'#fff',fontSize:40}}> {current?.temp_c}&#176;</Text>
                  <Text style={{ textAlign:"center",color:'#fff',fontSize:20,}}> {current?.condition?.text}</Text>
                </View>
                {/* other stats */}
                <View style={{flexDirection:'row',justifyContent:"space-between" ,marginLeft:20,marginRight:20}}>
                  <View style={{flexDirection:"row",alignItems:"center"}}>
                    <Image source={require('../icons/wind.png')} style={{height:25,width:25}}></Image>
                    <Text style={{color:"#FFF",textAlign:"center",fontWeight:"500",marginLeft:6,fontSize:15}}>{current?.wind_kph}Km</Text>
                  </View>
                  <View style={{flexDirection:"row",alignItems:"center"}}>
                    <Image source={require('../icons/drop.png')} style={{height:25,width:25}}></Image>
                    <Text style={{color:"#FFF",textAlign:"center",fontWeight:"500",marginLeft:6,fontSize:15}}>{current?.humidity  }%</Text>
                  </View>
                  <View style={{flexDirection:"row",alignItems:"center"}}>
                    <Image source={require('../icons/sun.png')} style={{height:25,width:25}}></Image>
                    <Text style={{color:"#FFF",textAlign:"center",fontWeight:"500",marginLeft:6,fontSize:15}}>{weather?.forecast?.forecastday[0]?.astro?.sunrise  }</Text>
                  </View>
                </View>
              </KeyboardAvoidingView>
            {/* forecast */}
              <View style={{marginTop:12,marginBottom:8}}>
                <View style={{flexDirection:"row",alignItems:"center",marginLeft:10}}>
                <Image source={require('../icons/calendar.png')} style={{height:40,width:40}}></Image>
                <Text style={{color:"#fff",marginLeft:5}}>Daily Forecast</Text>
                </View>
                <ScrollView horizontal contentContainerStyle={{paddingHorizontal:15}} 
                showsHorizontalScrollIndicator={false}>
                {
                  weather?.forecast?.forecastday?.map((item,index)=>{
                    let date=new Date(item.date);
                    let options={weekday:'long'};
                    let dayName=date.toLocaleDateString ('en-US',options);
                    dayName=dayName.split(',')[0]
                    return(
                      <View 
                      key={index}
                      style={[{backgroundColor: theme.bgWhite(0.2)},{justifyContent:"center",alignItems:"center",padding:7,marginRight:10,marginTop:10,borderRadius:10}]}>
                  <Image source={weatherImages[item?.day?.condition?.text]} style={{height:45,width:50}}></Image>
                  <Text style={{color:'#fff'}}>{dayName}</Text>
                  <Text style={{color:'#fff',fontWeight:"600",fontSize:18}}>{item?.day?.avgtemp_c}&#176;</Text>
                  </View>
                    )
                  })
                }
                </ScrollView>
              </View>
        </SafeAreaView >
        )
        
      }
      </View>
  )
}
const styles = StyleSheet.create({
  container:{
    flex:1,
    position:'relative',
  },
  img:{
    width:'100%',
    height:'100%',
    position:'absolute',
  },
  safe:{
    flex:1,
  },
  bar:{
    marginLeft:10,
    marginTop:40,
    height:50,
    flexDirection: 'row',
    justifyContent:'flex-end',
    alignItems: 'center',
    borderRadius:30,
    width:'95%',
  },
  btn:{
    borderRadius:20,
    padding:7,
    marginRight:10,
  },
  list:{
    marginLeft:10,
    width:'95%',
    position:'absolute',
    backgroundColor:'#fff',
    zIndex:1,
    top:100,
    borderRadius:40,
  },
  content:{
    flexDirection:'row',
    alignItems:'center',
    padding: 10,
    
    
  },
  fortxt:{
    color:"#fff",
    textAlign:"center",
    fontSize:24,
    fontWeight:'800'
  },
})