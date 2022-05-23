import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import Row from './Row';
import lang from '../../../assets/lang';

class Schedules extends Component {
  render() {
    return (
      <View style={style.container}>
        <View style={style.header}>
          <Text style={style.label} numberOfLines={1}>
            {lang.headTableSchedules[0]}
          </Text>
          <Text style={style.input} numberOfLines={1}>
            {lang.headTableSchedules[1]}
          </Text>
          <Text style={style.input} numberOfLines={1}>
            {lang.headTableSchedules[2]}
          </Text>
          <Text style={style.input} numberOfLines={1}>
            {lang.headTableSchedules[3]}
          </Text>
          <Text style={style.select} numberOfLines={1}>
            {lang.headTableSchedules[4]}
          </Text>
        </View>
        {!!this.props.data &&
          this.props.data.length > 0 &&
          this.props.data
            .sort((a, b) => a.day > b.day)
            .map((item, i) => (
              <Row
                key={i.toString()}
                item={item}
                onChange={newItem => {
                  const index = this.props.data.findIndex(
                    it => it.day === newItem.day,
                  );
                  this.props.data[index] = newItem;

                  if (this.props.onChange) {
                    this.props.onChange(this.props.data);
                  }
                }}
              />
            ))}
      </View>
    );
  }
}

const style = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    height: 30,
  },
  label: {
    height: '100%',
    textAlignVertical: 'center',
    flex: 1.5,
    paddingHorizontal: 5,
    fontSize: 11,
  },
  input: {
    flex: 1,
    height: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    minWidth: 50,
    fontSize: 11,
    paddingHorizontal: 2,
  },
  select: {
    flex: 1.5,
    paddingHorizontal: 5,
    height: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 11,
  },
});

export default Schedules;
