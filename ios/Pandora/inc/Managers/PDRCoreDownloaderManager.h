/*
 *------------------------------------------------------------------
 *  pandora/Managers/pdr_manager_downloader.h
 *  Description:
 *      下载头文件定义
 *  DCloud Confidential Proprietary
 *  Copyright (c) Department of Research and Development/Beijing/DCloud.
 *  All Rights Reserved.
 *
 *  Changelog:
 *	number	author	modify date modify record
 *   0       xty     2013-02-19 创建文件
 *------------------------------------------------------------------
 */
#import <Foundation/Foundation.h>
#import "PTPathUtil.h"
#import "PDRNetTask.h"
#import "PTOperation.h"

/*
 *@下载任务
 * 目前把网络功能放到该模块
 */
@interface PDRDownloadTask : PTNetTask<NSCoding>
{
    NSFileHandle *_fileHandle;
}

@property (nonatomic, retain) NSString *downloadDestinationPath;

- (void)willChangeToStatus:(PTOperationStatus)status;
- (void)didChangeToStatus;
//序列化
//子类重写时务必调用分类方法
-(void) encodeWithCoder:(NSCoder *)aCoder;
//将对象解码(反序列化)
-(id) initWithCoder:(NSCoder *)aDecoder;

- (void)netTask:(PTNetTask *)connection didReceiveResponse:(id)response;
- (void)netTask:(PTNetTask *)connection didReceiveData:(NSData *)data;
- (void)netTaskFinished:(PTNetTask *)connection;
@end

/*
 *@下载管理模块
 */
#pragma mark -
#pragma mark see source
@interface PDRManagerDownloader : PTOperationQueue
{
    @private
    //所有下载队列
    NSMutableArray *_downloadTaskHandles;
    //下载文件的配置访问
    NSString *_configFileFullPath;
}
#pragma mark -
#pragma mark Property
@property(nonatomic, readonly)NSString *configFilePath;

+ (PDRManagerDownloader*)shared;
- (void)quit;
- (void)addTask:(PDRDownloadTask*)task;
- (void)abortTask:(PDRDownloadTask*)task;
- (void)abortTaskWithStatus:(PTOperationStatus)status;
- (NSArray*)allTasks;
- (NSArray*)tasksWithStatus:(PTOperationStatus)status;
- (void)onStateChange:(PDRDownloadTask*)task toStatus:(PTOperationStatus)status;
@end
