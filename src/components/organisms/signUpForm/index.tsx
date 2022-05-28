import { MouseEvent, useEffect, useState } from 'react';

import { useForm, UseFormRegister } from 'react-hook-form';
import { useRecoilValue } from 'recoil';

import { SignUpFormInterface, SignUpData } from './index.type';
import { SignUpFormStyle, CheckIcon } from './styles';

import SubmitBtn from '@components/atoms/button/submit';
import SignUpInput from '@components/organisms/signUpInput';
import { MAJOR_TYPE } from '@constants/index';
import { userState } from '@store/user';
import { FlexDiv } from '@styles/index';
import { Select, Triangle, SubTitle } from '@styles/signUp';
import Auth from '@utils/api/Auth';

interface Props {
  handleModalOnOff: () => void;
  major: keyof typeof MAJOR_TYPE;
  onSubmitForm: (name: string, department: string, gitEmail: string, ajouEmail: string) => void;
}

interface SelectBoxProps extends Props {
  register: UseFormRegister<SignUpFormInterface>;
}

const MajorSelectBox = ({ major, handleModalOnOff, register }: SelectBoxProps) => {
  return (
    <div style={{ position: 'relative' }}>
      <Select onClick={handleModalOnOff} {...register('department', SignUpData.department)}>
        <option value={MAJOR_TYPE[major]} hidden>
          {MAJOR_TYPE[major]}
        </option>
      </Select>
      <Triangle />
    </div>
  );
};

const SignUpForm = ({ handleModalOnOff, major, onSubmitForm }: Props) => {
  const userInfo = useRecoilValue(userState);
  const userInfoJson = JSON.stringify(userInfo);
  const [editMode, setEditMode] = useState(false);

  const [checkEmail, setCheckEmail] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormInterface>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '@ajou.ac.kr',
    },
  });

  useEffect(() => {
    if (userInfoJson) {
      setEditMode(true);
      setValue('email', userInfo.ajouEmail);
      setValue('name', userInfo.name);
      setValue('department', userInfo.department);
      setValue('gitEmailId', userInfo.gitEmail ?? '');
    }
  }, [userInfoJson]);

  const onClickEmailAuth = async (e: MouseEvent<HTMLButtonElement>) => {
    if (emailCheckLoading) return; // 로딩중에는 동작 막아도 된다.
    e.preventDefault();
    // onSubmit이 아니기때문에 validation을 trigger한다.
    const result = await trigger('email');
    if (!result) return;

    const emailValue = getValues('email');
    const emailCodeValue = getValues('emailCheck');
    if (!checkEmail) {
      // 이메일 인증 필요
      try {
        setEmailCheckLoading(true);
        setCheckEmail(true);
        const data = await Auth.checkEmail(emailValue);
        setEmailCheckLoading(false);
        console.log('checkEmail data:', data);
      } catch (err) {
        console.log(err);
      }
    } else {
      // 이메일 인증 코드 확인
      try {
        const resData = await Auth.checkEmailCode(emailCodeValue);
        console.log('checkEmailCode data : ', resData);
        if (resData) {
          setIsEmailValid(true);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const onSubmit = (data: SignUpFormInterface) => {
    if (!isEmailValid && !editMode) return;
    console.log(data);
    onSubmitForm(data.name, major, data.gitEmailId, data.email);
  };

  const handleChange = () => {
    setIsEmailValid(false);
    setCheckEmail(false);
  };

  return (
    <SignUpFormStyle onSubmit={handleSubmit(onSubmit)}>
      <SignUpInput
        placeholder="이름"
        content="이름"
        {...register('name', SignUpData.name)}
        error={errors.name?.message}
      />
      <FlexDiv direction="row" style={{ position: 'relative' }}>
        <SignUpInput
          placeholder="아주대 메일"
          content="이메일 인증"
          buttonContent={!isEmailValid ? '인증' : undefined}
          onClick={(e) => {
            if (!editMode) onClickEmailAuth(e);
          }}
          {...register('email', SignUpData.email)}
          error={errors.email?.message}
          onChange={handleChange}
          authBtnSuspense={emailCheckLoading}
          disabled={editMode}
        />
        {isEmailValid && <CheckIcon />}
      </FlexDiv>
      {checkEmail && !isEmailValid && (
        <SignUpInput
          type="password"
          placeholder="인증번호를 입력하세요"
          buttonContent="확인"
          onClick={onClickEmailAuth}
          {...register('emailCheck', SignUpData.emailCheck)}
          error={errors.emailCheck?.message}
        />
      )}
      <FlexDiv direction="row">
        <SubTitle>학과</SubTitle>
        <MajorSelectBox
          major={major}
          register={register}
          handleModalOnOff={handleModalOnOff}
          onSubmitForm={onSubmitForm}
        />
      </FlexDiv>
      <SignUpInput
        placeholder="GIT 이메일"
        content="GIT 계정"
        {...register('gitEmailId', SignUpData.gitEmailId)}
        error={errors.gitEmailId?.message}
      />
      {!editMode && (
        <FlexDiv direction="column" style={{ gap: '0.5rem' }}>
          <FlexDiv direction="row" style={{ alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" name="" id="policy" />
            <label htmlFor="policy">이용약관 동의</label>
          </FlexDiv>

          <FlexDiv direction="row" style={{ alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" name="" id="privacy" />
            <label htmlFor="privacy">개인정보 이용 동의</label>
          </FlexDiv>
        </FlexDiv>
      )}
      <SubmitBtn size="medium">SAVE</SubmitBtn>
    </SignUpFormStyle>
  );
};

export default SignUpForm;
