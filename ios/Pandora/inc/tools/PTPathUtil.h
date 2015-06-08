/*
 *------------------------------------------------------------------
 *  pandora/tools/PTPathUtil.h
 *  Description:
 *     文件功能头文件
 *  DCloud Confidential Proprietary
 *  Copyright (c) Department of Research and Development/Beijing/DCloud.
 *  All Rights Reserved.
 *
 *  Changelog:
 *	number	author	modify date modify record
 *   0       xty     2013-02-19 创建文件
 *------------------------------------------------------------------
 */
@class PDRCoreApp;

@interface PTPathUtil : NSObject
+ (BOOL)allowsWritePath:(NSString*)path;
+ (BOOL)allowsWritePath:(NSString*)path
            withContext:(PDRCoreApp*)context;
+ (NSString*) getMimeTypeFromPath: (NSString*) fullPath;
+ (NSString*) absolutePath:(NSString*)srcPath
             suggestedPath:(NSString*)dPath
         suggestedFilename:(NSString*)suggestedFilename
                    prefix:(NSString*)prefix
                    suffix:(NSString*)suffix;

+ (NSString*) absolutePath:(NSString*)path
         suggestedFilename:(NSString*)suggestedFilename
                    prefix:(NSString*)prefix
                    suffix:(NSString*)suffix
                   context:(PDRCoreApp*)context;

+ (NSString*) absolutePath:(NSString*)relativePath
                    prefix:(NSString*)prefix
                    suffix:(NSString*)suffix
                   context:(PDRCoreApp*)context;
+ (NSURL*)urlWithPath:(NSString*)path;
+ (NSString*) h5Path2SysPath:(NSString*)path basePath:(NSString*)basePath;
+ (NSString*) sysPath2H5path:(NSString*)path;
//根据PDR规范的相对路径获取系统绝对路径
+ (NSString*) absolutePath:(NSString*)relativePath;
+ (NSString*) absolutePath:(NSString*)relativePath
                   withContext:(PDRCoreApp*)context;
+ (NSString*) absolutePath:(NSString*)relativePath
               withContext:(PDRCoreApp*)context
                   default:(NSString*)defaultPath;
//根据系统绝对路径获取PDR规范的相对路径
+ (NSString*) relativePath:(NSString*)absolutePath;
+ (NSString*) relativePath:(NSString*)absolutePath
               withContext:(PDRCoreApp*)context;
+ (BOOL) isFile:(NSString*)path;
+ (NSString*)uniquePath:(NSString*)parentPath
             withPrefix:(NSString*)prefix
                 suffix:(NSString*)suffix;
+ (NSString*)uniqueNameInAppDocHasPrefix:(NSString*)prefix
                                   suffix:(NSString*)suffix;
+ (NSString*)uniqueNameInAppDocHasPrefix:(NSString*)prefix
                                  suffix:(NSString*)suffix
                                 context:(PDRCoreApp*)context;
+ (void)ensureDirExist:(NSString*)path;
+ (NSString*)sysLibrayPath;
+ (NSString*)sysTmpPath;

+ (NSString*)runtimeRootPathB;
+ (NSString*)appPathWithAppidB:(NSString*)appid;
+ (NSString*)appWWWPathWithAppidB:(NSString*)appid;

+ (NSString*)appRootPathWithAppidL:(NSString*)appid;
+ (NSString*)appDataPathWithAppidL:(NSString*)appid;
+ (NSString*)appWWWPathWithAppidL:(NSString*)appid;
+ (NSString*)appTempPathWithAppid:(NSString*)appid;
+ (NSString*)appDebugPathWithAppidL:(NSString*)appid;
+ (NSString*)manifestPathWithAppidL:(NSString*)appid;
+ (NSString*)manifestPathWithAppidB:(NSString*)appid;
//设置接口
+ (void)setRuntimeRootPathL:(NSString*)rootPathL;
+ (void)setRuntimeRootPathB:(NSString*)rootPathB;
+ (void)setRuntimeDocumentPath:(NSString*)doucumentPath;
+ (void)setRuntimeDownloadPath:(NSString*)downloadPath;

//pdr libray root path
+ (NSString*)runtimeRootPathL;
//获取设置pdr apps目录libray/Pandora/apps
+ (NSString*)runtimeAppsPathL;
+ (void)setRuntimeAppsPathL:(NSString*)appPathL;
//获取pdr apps目录MainBudle/Pandora/apps
+ (NSString*)runtimeAppsPathB;
+ (void)setRuntimeAppsPathB:(NSString*)appPathB;

//获取pdr Doc目录libray/Pandora/document
+ (NSString*)runtimeDocumentPath;
//获取pdr下载目录libray/Pandora/download
+ (NSString*)runtimeDownloadPath;
//获取pdr日志目录libray/Pandora/log
+ (NSString*)runtimeLogPath;
//获取pdr临时目录/temp
+ (NSString*)runtimeTmpPath;
+ (void)clearRuntimeTmpPath;
+ (NSString*)standardizingPath:(NSString*)path;
//释放path相关内存
+ (void)free;
//在指定的目录下生成一个唯一的目录
+ (NSString*)uniquePathInPath:(NSString*)path;
@end

@interface PTFSUtil : NSObject
//获取文件的大小
+ (long long) fileSizeAtPath:(NSString*) filePath;
+ (long long) folderSizeAtPath:(NSString*) folderPath;
/**
 * @Summay :获取目录大小目录中元素数目
 * @Param :
 *      [1] folderPath 目录全路径
 *      [2] deep 是否深度遍历
 *      [3] outDirCount 含有目录数目
 *      [4] outFileCount 含有的文件数目
 * @Return :
 *     long long 目录下所有文件大小之和
 * @Descript
 * @Modify
 **/
+ (long long) folderSizeAtPath:(NSString*) folderPath
                          deep:(BOOL)deep
                      dirCount:(long long*)outDirCount
                     fileCount:(long long*)outFileCount;
@end