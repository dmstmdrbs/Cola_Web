import styled from '@emotion/styled';

export interface HashtagChipInterface {
  size?: string;
}
const Container = styled.div<HashtagChipInterface>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  width: 100%;
  border-radius: 15px;
  background-color: #4b48e7;
  opacity: 0.9;
  transition: 0.1s;
  padding: 0 5px 0 10px;
  margin: 0.2rem 0;
  color: whitesmoke;
  cursor: pointer;
  &:hover {
    background-color: #5f5cec;
  }
`;
const RemoveBtn = styled.button`
  background: none;
  border-radius: 100%;
  transition: 0.1s;
  color: whitesmoke;
  cursor: pointer;
  border: none;
  &:hover {
    background-color: #282f91;
    opacity: 0.8;
  }
`;
export { Container, RemoveBtn };
