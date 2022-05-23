import React from 'react';
import styled from 'styled-components';
import {baseContentStyle, baseOverlayStyle} from '../Modal';

export const contentStyle: React.CSSProperties = {
  ...baseContentStyle,
  width: 676,
  minHeight: 300,
  padding: '35px 20px 42px 80px',
  boxSizing: 'border-box',
  position: 'relative',
  textAlign: 'left',
  cursor: 'default',
  boxShadow: '0px 10px 10px #2148ff1a',
};

export const overlayStyle: React.CSSProperties = {
  ...baseOverlayStyle,
  background: 'rgba(255,255,255,0.8)',
};

export const Title = styled.header`
  color: #161643;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 20px;
  margin-bottom: 5px;
`;

export const SubTitle = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  font-size: 16px;
  margin-bottom: 20px;
`;

export const PlanContainer = styled.div`
  margin-bottom: 13px;
  display: grid;
  grid-template-columns: minmax(150px, min-content) 1fr;
  align-items: center;
`;

export const PricingTile = styled.section`
  min-width: 443px;
  width: min-content;
  min-height: 136px;
  padding: 20px;
  box-sizing: border-box;
  background-color: #ffffff;
  box-shadow: 0 0 7px #2699fb29;
  border-radius: 6px;

  & > header {
    font-family: ProximaNova-Medium, sans-serif;
    color: #161643;
    font-size: 15px;
    margin-bottom: 16px;
  }

  & ${PlanContainer}:last-child {
    margin-bottom: 0;
  }
`;

export const PlanPeriodicity = styled.span`
  background-color: #385cf8;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: white;
  padding: 4px 16px;
  margin-right: 16px;
  text-align: center;
`;

export const PlanPrice = styled.span`
  font-family: ProximaNova-Bold, sans-serif;
  color: #385cf8;
  font-size: 24px;
`;

export const PlanPriceLabel = styled.span`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #161643;
  text-transform: lowercase;
`;

export const SubscriptionType = styled.div`
  color: #161643;
  font-family: ProximaNova-Medium, sans-serif;
  margin-bottom: 16px;
  font-size: 15px;
`;

export const CloseButton = styled.button`
  position: absolute;
  right: 19px;
  top: 16px;
  width: 36px;
  height: 38px;
  box-shadow: 0 10px 10px #2148ff1a;
  border-radius: 6px;
  text-align: center;
  outline: none;
  padding: 0;
  border: none;
  background-color: white;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }

  & > img {
    height: 15px;
    vertical-align: middle;
  }
`;

export const Dot = styled.div`
  width: 10px;
  height: 10px;
  background-color: #eeeeee;
  border-radius: 50%;
`;

export const ThreeDotsGroup = styled.div`
  display: flex;
  align-items: center;
  margin: 28px 0;

  & ${Dot}:nth-child(2) {
    margin: 0 21px;
  }
`;

export const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 60px;
  margin-top: 30%;
`;

export const Notes = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  color: #161643;
  margin-top: 30px;
  padding-right: 35px;
`;
