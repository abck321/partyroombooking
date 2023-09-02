import styled from 'styled-components';

const LoadingDiv = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const DatabaseLoading = ({loadingString}) => {
    return ( 
        <LoadingDiv>
            <h1>{loadingString}</h1>
        </LoadingDiv>
     );
}
 
export default DatabaseLoading;