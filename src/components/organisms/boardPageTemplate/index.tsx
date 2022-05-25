import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from 'react-query';
import { useRecoilState } from 'recoil';

import { BoardLayout, boardTypeState } from '../../../store/board';
import { Spinner } from '../signUpInput/styles';

import SimpleType from '@assets/icon/board_detail_type.svg';
import GridType from '@assets/icon/board_grid_type.svg';
import ListType from '@assets/icon/board_list_type.svg';
import BoardCard from '@molecules/boardType/boardCard';
import BoardPreviewItem from '@molecules/boardType/boardPreviewItem';
import BoardSimpleItem from '@molecules/boardType/boardSimpleItem';
import {
  Container,
  BoardList,
  BoardListTitle,
  BoardListUtilWrapper,
  WritePost,
  FlexEnd,
  TypeIcon,
} from '@styles/board';
import { Board as BoardApi } from '@utils/api/Board';

interface IPost {
  postId: number;
  title: string;
  userInfo: {
    userId: number;
    userName: string;
  };
  createdDate: string;
  modifiedDate: string;
}
interface IQueryPage {
  result: IPost[];
  nextPage: number | null;
  isLast: boolean;
}
const Board = ({ boardCategory }: { boardCategory: 'common' | 'info' | 'qna' }) => {
  const { ref, inView, entry } = useInView();
  const router = useRouter();
  const [boardType, setBoardType] = useRecoilState(boardTypeState);

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery<IQueryPage>(
    ['boardlist', boardCategory],
    ({ pageParam = 0 }) => BoardApi.getList({ pageParam, boardCategory }),
    {
      getNextPageParam: (lastPage, pages) => {
        if (!lastPage.isLast) return lastPage.nextPage;
        return undefined;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
    },
  );
  const [posts, setPosts] = useState<IPost[]>([]);

  useEffect(() => {
    const fetchPages = data?.pages;
    if (fetchPages) {
      console.log('post', fetchPages?.map((pages) => pages.result).flat());
      setPosts(fetchPages?.map((pages) => pages.result).flat() as IPost[]);
    }
  }, [isLoading, data]);
  useEffect(() => {
    if (!isLoading && hasNextPage && inView) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <BoardListTitle>
          {boardCategory === 'common' ? '자유' : boardCategory === 'info' ? '정보' : '질문'}게시판
        </BoardListTitle>
        <BoardListUtilWrapper>
          <FlexEnd>
            <Link href={`/board/${boardCategory}/write`}>
              <WritePost>글쓰기</WritePost>
            </Link>
          </FlexEnd>
          <FlexEnd>
            <select name="" id="">
              <option value="recent">최신순</option>
              <option value="popular">인기순</option>
            </select>
          </FlexEnd>
          <FlexEnd>
            <TypeIcon clicked={boardType === BoardLayout.TILE} onClick={() => setBoardType(BoardLayout.TILE)}>
              <GridType />
            </TypeIcon>
            <TypeIcon
              clicked={boardType === BoardLayout.PREVIEW_LIST}
              onClick={() => setBoardType(BoardLayout.PREVIEW_LIST)}
            >
              <ListType />
            </TypeIcon>
            <TypeIcon
              clicked={boardType === BoardLayout.SIMPLE_LIST}
              onClick={() => setBoardType(BoardLayout.SIMPLE_LIST)}
            >
              <SimpleType />
            </TypeIcon>
          </FlexEnd>
        </BoardListUtilWrapper>
      </div>
      <section>
        {isLoading && (
          <BoardList type={boardType}>
            <Spinner size="3rem" color="#b2c9ff" />
          </BoardList>
        )}
        {!isLoading && (
          <BoardList type={boardType}>
            {posts.length === 0 ? (
              <div>
                <p>게시글이 없습니다.</p>
              </div>
            ) : null}
            {posts.map((post, i) => (
              <>
                {boardType === BoardLayout.TILE && (
                  <BoardCard
                    key={post.postId}
                    id={post.postId}
                    title={post.title}
                    username={post.userInfo.userName}
                    createdAt={post.createdDate}
                  />
                )}
                {boardType === BoardLayout.PREVIEW_LIST && (
                  <BoardPreviewItem
                    key={post.postId}
                    title={post.title}
                    id={post.postId}
                    username={post.userInfo.userName}
                    createdAt={post.createdDate}
                  />
                )}
                {boardType === BoardLayout.TILE && (
                  <BoardSimpleItem
                    key={post.postId}
                    id={post.postId}
                    title={post.title}
                    username={post.userInfo.userName}
                    createdAt={post.createdDate}
                  />
                )}
              </>
            ))}
          </BoardList>
        )}
      </section>
      <div ref={ref} style={{ width: '100%', height: '5rem' }}></div>
    </Container>
  );
};
export default Board;