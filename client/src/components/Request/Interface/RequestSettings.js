import React, {useState} from 'react';
import ApiInput from '../Api/ApiInput';
import MethodSelector from '../Api/MethodSelector';
import QueryParamsInput from '../Api/QueryParamsInput';
import AuthInput from '../Api/AuthInput';
import HeadersInput from '../Api/HeadersInput';
import BodyInput from '../Api/BodyInput';
import FileInput from '../Api/FileInput';
import AssertionsInput from '../Api/AssertionsInput';
import Accordion from './Accordion';

const RequestSetting =({
  apiUrl,
  method,
  queryParams,
  auth,
  headers,
  body,
  file,
  assertions,
  onApiUrlChange,
  onMethodChange,
  onQueryParamsChange,
  onAuthChange,
  onHeadersChange,
  onBodyChange,
  onFileChange,
  onAssertionsChange,
})=>{
  return(
    <div>
    Request Settings
      <ApiInput value={apiUrl} onChange={onApiUrlChange}/>
      <MethodSelector value={method} onChange={onMethodChange}/>
      <HeadersInput value={headers} onChange={onHeadersChange}/>
      <BodyInput value={body} onChange={onBodyChange}/>

      <Accordion>
      <QueryParamsInput onChange={onQueryParamsChange}/>
      <AuthInput onChange={onAuthChange}/>
      <FileInput onChange={onFileChange}/>
      <AssertionsInput onChange={onAssertionsChange}/>
      </Accordion>
    </div>
  );
};

export default RequestSetting;